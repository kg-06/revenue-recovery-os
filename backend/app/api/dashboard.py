from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter

from app.services.database import db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

IST = ZoneInfo("Asia/Kolkata")


@router.get("/summary")
async def summary():
    records = await db.payment_records.find().to_list(length=None)

    today = datetime.now(IST).date()

    total_cases = len(records)

    active_records = [
        r for r in records
        if r.get("status") != "paid"
    ]

    revenue_at_risk = sum(r["amount"] for r in active_records)

    recovered_today = 0
    recovered_count = 0

    for record in records:
        if record.get("status") == "paid":
            recovered_count += 1

            recovered_at = record.get("recovered_at")

            if recovered_at:
                # Handle old naive timestamps and new timezone-aware ones.
                if recovered_at.tzinfo is None:
                    recovered_at = recovered_at.replace(tzinfo=IST)
                else:
                    recovered_at = recovered_at.astimezone(IST)

                if recovered_at.date() == today:
                    recovered_today += record["amount"]

    recovery_rate = (
        round((recovered_count / total_cases) * 100, 1)
        if total_cases > 0
        else 0
    )

    return {
        "total_cases": len(active_records),  # Active cases shown on dashboard
        "revenue_at_risk": revenue_at_risk,
        "recovered_today": recovered_today,
        "recovery_rate": recovery_rate,
    }