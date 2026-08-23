from fastapi import APIRouter
from app.services.database import db

router = APIRouter(prefix="/recovery", tags=["Recovery"])


@router.get("/cases")
async def recovery_cases():
    # Get payment records sorted by highest risk first
    records = (
        await db.payment_records
        .find()
        .sort("risk_score", -1)
        .to_list(length=None)
    )

    # Load all workflows once (avoids N database queries)
    workflows = await db.recovery_workflows.find().to_list(length=None)

    workflow_map = {
        w["payment_record_id"]: w
        for w in workflows
    }

    merged = []

    for record in records:
        workflow = workflow_map.get(record["record_id"])

        record["_id"] = str(record["_id"])

        if workflow:
            record["current_state"] = workflow.get("current_state", "at_risk")
            record["workflow_timeline"] = workflow.get("timeline", [])
            record["last_email_id"] = workflow.get("last_email_id")
            record["razorpay_order_id"] = workflow.get("razorpay_order_id")
        else:
            record["current_state"] = "at_risk"
            record["workflow_timeline"] = []

        merged.append(record)

    return merged