import os
import httpx
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
SENDER_NAME = os.getenv("BREVO_SENDER_NAME")

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


async def send_recovery_email(
    to_email: str,
    customer_name: str,
    subject: str,
    html_content: str,
):
    """
    Sends a recovery email through Brevo.

    Returns:
        {
            "success": True,
            "message_id": "...",
        }
    """

    if not BREVO_API_KEY:
        raise Exception("BREVO_API_KEY missing from environment variables.")

    payload = {
        "sender": {
            "name": SENDER_NAME,
            "email": SENDER_EMAIL,
        },
        "to": [
            {
                "email": to_email,
                "name": customer_name,
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            BREVO_URL,
            json=payload,
            headers=headers,
        )

    if response.status_code not in (200, 201):
        raise Exception(f"Brevo Error: {response.text}")

    data = response.json()

    return {
        "success": True,
        "message_id": data.get("messageId"),
    }