import pandas as pd
from fastapi import UploadFile
from io import StringIO


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

    missing = [
        col for col in REQUIRED_COLUMNS
        if col not in df.columns
    ]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    records = df.to_dict(orient="records")

    return records