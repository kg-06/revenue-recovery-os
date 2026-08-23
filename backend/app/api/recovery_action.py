from datetime import datetime
import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.recovery_agent import generate_recovery_email
from app.services.database import db
from app.services.email_service import send_recovery_email
from app.services.razorpay_service import create_payment_order

from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
DEMO_EMAIL = os.getenv("DEMO_EMAIL")

router = APIRouter(prefix="/recovery", tags=["Recovery Agent"])


class RecoveryRequest(BaseModel):
    record_id: str


@router.post("/send")
async def send_recovery(request: RecoveryRequest):
    payment = await db.payment_records.find_one(
        {
            "$or": [
                {"record_id": request.record_id},
                {"payment_id": request.record_id},
                {"transaction_id": request.record_id},
            ]
        }
    )

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")

    if not payment.get("root_cause"):
        raise HTTPException(
            status_code=400,
            detail="Generate AI diagnosis first.",
        )

    # Create a real Razorpay Test Order
    order = create_payment_order(
        record_id=payment["record_id"],
        amount=payment["amount"],
        customer_name=payment["customer_name"],
    )

    checkout_url = (
        f"{FRONTEND_URL}/checkout?"
        f"order_id={order['order_id']}"
        f"&record_id={payment['record_id']}"
    )

    payment_context = {
        **payment,
        "checkout_url": checkout_url,
        "order_id": order["order_id"],
    }

    # AI chooses intervention + writes the email
    email = await generate_recovery_email(payment_context)

    recipient = DEMO_EMAIL if DEMO_EMAIL else payment["email"]

    result = await send_recovery_email(
        to_email=recipient,
        customer_name=payment["customer_name"],
        subject=email["subject"],
        html_content=email["html"],
    )

    # Save the AI decision into the payment record
    await db.payment_records.update_one(
        {"record_id": payment["record_id"]},
        {
            "$set": {
                "selected_playbook": email["decision"]["selected_playbook"],
                "playbook_reasoning": email["decision"]["reasoning"],
                "playbook_tone": email["decision"]["tone"],
                "playbook_urgency": email["decision"]["urgency"],
                "last_email_id": result["message_id"],
                "razorpay_order_id": order["order_id"],
            }
        },
    )

    # Update workflow and create an audit entry
    await db.recovery_workflows.update_one(
        {"payment_record_id": payment["record_id"]},
        {
            "$set": {
                "current_state": "email_sent",
                "last_email_id": result["message_id"],
                "razorpay_order_id": order["order_id"],
            },
            "$push": {
                "timeline": {
                    "state": "email_sent",
                    "timestamp": datetime.now(IST),
                    "details": (
                        f"AI selected '{email['decision']['selected_playbook']}' "
                        f"playbook and sent a Razorpay recovery email."
                    ),
                }
            },
        },
    )

    return {
        "success": True,
        "message_id": result["message_id"],
        "order_id": order["order_id"],
        "checkout_url": checkout_url,
        "decision": email["decision"],
    }