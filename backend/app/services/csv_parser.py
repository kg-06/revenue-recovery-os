import pandas as pd
from fastapi import UploadFile
from io import StringIO
from app.models.payment import PaymentRecord
import hashlib

REQUIRED_COLUMNS = [
    "customer_name",
    "email",
    "amount",
    "payment_type",
    "status",
    "failure_reason",
    "due_date",
    "attempts",
]

async def parse_payment_csv(file: UploadFile):
    content = await file.read()
    csv_text = content.decode("utf-8")

    df = pd.read_csv(StringIO(csv_text))

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    from app.models.payment import PaymentRecord

    records = []

    for row in df.to_dict(orient="records"):
        unique_string = (
            f"{row['customer_name']}|"
            f"{row['email']}|"
            f"{row['amount']}|"
            f"{row['payment_type']}|"
            f"{row['due_date']}"
        )

        row["record_id"] = hashlib.sha256(unique_string.encode()).hexdigest()

        payment = PaymentRecord(**row)
        records.append(payment.model_dump(mode="json"))

    return records