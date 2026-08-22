from fastapi import APIRouter, HTTPException
from google.genai.errors import ClientError

from app.services.database import db
from app.agents.diagnosis_agent import generate_batch_diagnosis

router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])


@router.post("/generate")
async def generate_batch():
    records = await db.payment_records.find().to_list(length=None)

    pending = [r for r in records if not r.get("root_cause")]

    if not pending:
        return {"processed": 0}

    diagnosis_input = []

    for record in pending:
        diagnosis_input.append({
            "customer_name": record["customer_name"],
            "amount": record["amount"],
            "payment_type": record["payment_type"],
            "status": record["status"],
            "failure_reason": record["failure_reason"],
            "attempts": record["attempts"],
            "risk_score": record["risk_score"],
        })

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

        diagnoses = await generate_batch_diagnosis(diagnosis_input)

        for record, diagnosis in zip(batch_records, diagnoses):
            await db.payment_records.update_one(
                {"_id": record["_id"]},
                {"$set": diagnosis},
            )

        processed += 1

    return {"processed": processed}