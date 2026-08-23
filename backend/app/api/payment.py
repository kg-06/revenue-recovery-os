from datetime import datetime
from zoneinfo import ZoneInfo
import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request

from app.services.database import db
from app.services.razorpay_service import KEY_ID, client

load_dotenv()

router = APIRouter(prefix="/payment", tags=["Payment"])

IST = ZoneInfo("Asia/Kolkata")
WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")


@router.get("/checkout-config")
async def checkout_config(record_id: str):
    payment = await db.payment_records.find_one({"record_id": record_id})

    if not payment:
        raise HTTPException(404, "Payment not found.")

    workflow = await db.recovery_workflows.find_one(
        {"payment_record_id": record_id}
    )

    if not workflow or "razorpay_order_id" not in workflow:
        raise HTTPException(400, "No Razorpay order exists.")

    return {
        "key_id": KEY_ID,
        "order_id": workflow["razorpay_order_id"],
        "amount": int(payment["amount"] * 100),
        "customer_name": payment["customer_name"],
        "email": payment["email"],
    }


@router.post("/verify-payment")
async def verify_payment(payload: dict):
    """
    Immediate server-side payment verification.

    This verifies the Razorpay Checkout signature before
    marking the payment as recovered.
    """

    record_id = payload["record_id"]

    workflow = await db.recovery_workflows.find_one(
        {"payment_record_id": record_id}
    )

    if not workflow:
        raise HTTPException(404, "Workflow not found.")

    if workflow.get("current_state") == "closed":
        return {
            "success": True,
            "already_processed": True,
        }

    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload["razorpay_order_id"],
                "razorpay_payment_id": payload["razorpay_payment_id"],
                "razorpay_signature": payload["razorpay_signature"],
            }
        )
    except Exception:
        raise HTTPException(400, "Invalid payment signature.")

    now = datetime.now(IST)

    await db.payment_records.update_one(
        {"record_id": record_id},
        {
            "$set": {
                "status": "paid",
                "recovered_at": now,
                "razorpay_payment_id": payload["razorpay_payment_id"],
            }
        },
    )

    await db.recovery_workflows.update_one(
        {"payment_record_id": record_id},
        {
            "$set": {"current_state": "closed"},
            "$push": {
                "timeline": {
                    "$each": [
                        {
                            "state": "payment_received",
                            "timestamp": now,
                            "details": "Payment verified through Razorpay.",
                        },
                        {
                            "state": "closed",
                            "timestamp": now,
                            "details": "Recovery workflow completed.",
                        },
                    ]
                }
            },
        },
    )

    return {"success": True}


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """
    Production Razorpay webhook.
    """

    raw_body = await request.body()

    signature = request.headers.get("X-Razorpay-Signature")
    event_id = request.headers.get("X-Razorpay-Event-Id")

    if not signature:
        raise HTTPException(400, "Missing webhook signature.")

    try:
        client.utility.verify_webhook_signature(
            raw_body.decode(),
            signature,
            WEBHOOK_SECRET,
        )
    except Exception:
        raise HTTPException(400, "Webhook signature invalid.")

    payload = await request.json()

    if payload.get("event") != "payment.captured":
        return {"ignored": True}

    payment = payload["payload"]["payment"]["entity"]

    order_id = payment["order_id"]

    workflow = await db.recovery_workflows.find_one(
        {"razorpay_order_id": order_id}
    )

    if not workflow:
        return {"ignored": True}

    if workflow.get("current_state") == "closed":
        return {
            "success": True,
            "already_processed": True,
            "event_id": event_id,
        }

    now = datetime.now(IST)

    await db.payment_records.update_one(
        {"record_id": workflow["payment_record_id"]},
        {
            "$set": {
                "status": "paid",
                "recovered_at": now,
                "razorpay_payment_id": payment["id"],
            }
        },
    )

    await db.recovery_workflows.update_one(
        {"payment_record_id": workflow["payment_record_id"]},
        {
            "$set": {"current_state": "closed"},
            "$push": {
                "timeline": {
                    "$each": [
                        {
                            "state": "payment_received",
                            "timestamp": now,
                            "details": "Payment captured through Razorpay Webhook.",
                        },
                        {
                            "state": "closed",
                            "timestamp": now,
                            "details": "Recovery workflow completed.",
                        },
                    ]
                }
            },
        },
    )

    return {
        "success": True,
        "event_id": event_id,
    }