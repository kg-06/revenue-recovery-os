from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.csv_parser import parse_payment_csv
from app.services.database import db

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

    await db.payment_records.insert_many(records)

    total_amount = sum(record["amount"] for record in records)

    return {
        "success": True,
        "imported": len(records),
        "total_amount": total_amount,
    }