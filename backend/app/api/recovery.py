from fastapi import APIRouter
from app.services.database import db

router = APIRouter(prefix="/recovery", tags=["Recovery"])


@router.get("/cases")
async def recovery_cases():
    records = (
        await db.payment_records
        .find()
        .sort("risk_score", -1)
        .to_list(length=None)
    )

    # Convert MongoDB ObjectId to string
    for record in records:
        record["_id"] = str(record["_id"])

    return records