from datetime import timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter
from app.services.database import db

router = APIRouter(prefix="/workflow", tags=["Workflow"])

IST = ZoneInfo("Asia/Kolkata")


@router.get("/{payment_id}")
async def get_workflow(payment_id: str):
    workflow = await db.recovery_workflows.find_one(
        {"payment_record_id": payment_id}
    )

    if not workflow:
        return None

    workflow["_id"] = str(workflow["_id"])

    for event in workflow["timeline"]:
        ts = event["timestamp"]

        # Old records created with datetime.utcnow() are naive UTC.
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        # Convert everything to IST before sending to the frontend.
        event["timestamp"] = ts.astimezone(IST).isoformat()

    return workflow