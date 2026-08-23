from fastapi import APIRouter, UploadFile, File, HTTPException
from pymongo import UpdateOne

from app.services.csv_parser import parse_payment_csv
from app.services.database import db
from app.agents.detection_agent import calculate_risk
from app.services.workflow import create_initial_workflow

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

    operations = []
    workflow_docs = []

    for record in records:
        score, priority = calculate_risk(record)
        record["risk_score"] = score
        record["priority"] = priority

        existing_payment = await db.payment_records.find_one(
            {"record_id": record["record_id"]}
        )

        existing_workflow = await db.recovery_workflows.find_one(
            {"payment_record_id": record["record_id"]}
        )

        # -----------------------------------------
        # Preserve workflow state (source of truth)
        # -----------------------------------------
        if existing_workflow:
            state = existing_workflow.get("current_state")

            if state == "closed":
                record["status"] = "paid"

                # Preserve recovery metadata
                if existing_payment:
                    record["recovered_at"] = existing_payment.get("recovered_at")
                    record["razorpay_payment_id"] = existing_payment.get(
                        "razorpay_payment_id"
                    )

            elif state == "payment_received":
                record["status"] = "paid"

            elif state in ["email_sent", "diagnosis_generated"]:
                # Don't regress these customers back to "failed"
                if existing_payment and existing_payment.get("status"):
                    record["status"] = existing_payment["status"]

        operations.append(
            UpdateOne(
                {"record_id": record["record_id"]},
                {"$set": record},
                upsert=True,
            )
        )

        if not existing_workflow:
            workflow_docs.append(
                create_initial_workflow(record["record_id"])
            )

    result = await db.payment_records.bulk_write(operations)

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