from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException
from pymongo import UpdateOne

from app.services.csv_parser import parse_payment_csv
from app.services.database import db
from app.agents.detection_agent import calculate_risk
from app.services.workflow import create_initial_workflow

from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/payments")
async def upload_payments(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    try:
        records = await parse_payment_csv(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not records:
        raise HTTPException(status_code=400, detail="CSV contains no valid records.")

    # Calculate risk score and priority
    for record in records:
        score, priority = calculate_risk(record)
        record["risk_score"] = score
        record["priority"] = priority

    # Upsert payment records
    operations = [
        UpdateOne(
            {"record_id": record["record_id"]},
            {"$set": record},
            upsert=True,
        )
        for record in records
    ]

    result = await db.payment_records.bulk_write(operations)

    # Fetch existing workflows in one query (instead of N find_one calls)
    record_ids = [record["record_id"] for record in records]

    existing_workflows = await db.recovery_workflows.find(
        {"payment_record_id": {"$in": record_ids}}
    ).to_list(length=None)

    existing_ids = {wf["payment_record_id"] for wf in existing_workflows}

    workflow_docs = []

    for record in records:
        if record["record_id"] not in existing_ids:
            workflow = create_initial_workflow(record["record_id"])

            # Immediately advance to Risk Scored.
            workflow["current_state"] = "risk_scored"

            workflow["timeline"].append(
                {
                    "state": "risk_scored",
                    "timestamp": datetime.now(IST),
                    "details": f"Detection Agent assigned a risk score of {record['risk_score']} and priority {record['priority']}.",
                }
            )

            workflow_docs.append(workflow)

    if workflow_docs:
        await db.recovery_workflows.insert_many(workflow_docs)

    total_amount = sum(record["amount"] for record in records)

    return {
        "success": True,
        "processed": len(records),
        "inserted": result.upserted_count,
        "updated": result.modified_count,
        "total_amount": total_amount,
    }