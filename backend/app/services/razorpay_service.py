import os
import hashlib

import razorpay
from dotenv import load_dotenv

load_dotenv()

KEY_ID = os.getenv("RAZORPAY_KEY_ID")
KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))


def create_payment_order(
    record_id: str,
    amount: float,
    customer_name: str,
):
    """
    Creates a Razorpay Test Order.

    Returns:
        {
            "order_id": "...",
            "key_id": "...",
            "amount": ...
        }
    """

    # Razorpay allows receipt max length of 56 characters.
    # Keep it short but deterministic.
    short_hash = hashlib.sha1(record_id.encode()).hexdigest()[:12]
    receipt = f"rr-{short_hash}"

    order = client.order.create(
        {
            "amount": int(amount * 100),  # Amount in paise
            "currency": "INR",
            "receipt": receipt,
            "notes": {
                "record_id": record_id,
                "customer": customer_name,
            },
        }
    )

    return {
        "order_id": order["id"],
        "key_id": KEY_ID,
        "amount": order["amount"],
        "receipt": receipt,
    }