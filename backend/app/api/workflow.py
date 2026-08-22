from fastapi import APIRouter
from app.services.database import db

router = APIRouter(prefix="/workflow", tags=["Workflow"])


@router.get("/{payment_id}")
async def get_workflow(payment_id: str):
    workflow = await db.recovery_workflows.find_one(
        {"payment_record_id": payment_id}
    )

    if not workflow:
        return None

    workflow["_id"] = str(workflow["_id"])

    for event in workflow["timeline"]:
        event["timestamp"] = event["timestamp"].isoformat()

    return workflow