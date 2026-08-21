from fastapi import APIRouter
from app.services.database import db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def summary():
    records = await db.payment_records.find().to_list(length=None)

    revenue_at_risk = sum(
        record["amount"]
        for record in records
        if record["status"] != "paid"
    )

    return {
        "total_cases": len(records),
        "revenue_at_risk": revenue_at_risk,
        "recovered_today": 0,
        "recovery_rate": 0,
    }