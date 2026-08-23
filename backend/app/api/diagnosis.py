from datetime import datetime

from fastapi import APIRouter
from google.genai.errors import ClientError

from app.services.database import db
from app.agents.diagnosis_agent import generate_batch_diagnosis

router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])

from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


@router.post("/generate")
async def generate_batch():
    records = await db.payment_records.find().to_list(length=None)

    pending = [r for r in records if not r.get("root_cause")]

    if not pending:
        return {"processed": 0}

    processed = 0
    batch_size = 10

    for i in range(0, len(pending), batch_size):
        batch_records = pending[i:i + batch_size]

        diagnosis_input = []

        for record in batch_records:
            diagnosis_input.append({
                "customer_name": record["customer_name"],
                "amount": record["amount"],
                "payment_type": record["payment_type"],
                "status": record["status"],
                "failure_reason": record["failure_reason"],
                "attempts": record["attempts"],
                "risk_score": record["risk_score"],
            })

        try:
            diagnoses = await generate_batch_diagnosis(diagnosis_input)

        except ClientError as e:
            status_code = getattr(e, "code", None) or getattr(e, "status", None)

            if status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Gemini rate limit reached. Please try again in a minute.",
                )

            raise HTTPException(
                status_code=500,
                detail="Failed to generate AI diagnoses.",
            )

        for record, diagnosis in zip(batch_records, diagnoses):
            # Save AI diagnosis to the payment record
            await db.payment_records.update_one(
                {"_id": record["_id"]},
                {"$set": diagnosis},
            )

            # Advance workflow to Diagnosis Generated
            await db.recovery_workflows.update_one(
                {"payment_record_id": record["record_id"]},
                {
                    "$set": {
                        "current_state": "diagnosis_generated"
                    },
                    "$push": {
                        "timeline": {
                            "state": "diagnosis_generated",
                            "timestamp": datetime.now(IST),
                            "details": "AI generated root cause and recovery strategy.",
                        }
                    },
                },
            )

        processed += len(batch_records)

    return {"processed": processed}