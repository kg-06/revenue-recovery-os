from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


def create_initial_workflow(payment_id: str):
    now = datetime.now(IST)

    return {
        "payment_record_id": payment_id,
        "current_state": "risk_assessed",
        "recovered_amount": 0,
        "timeline": [
            {
                "state": "at_risk",
                "timestamp": now,
                "details": "Payment imported and marked as revenue at risk.",
            },
            {
                "state": "risk_assessed",
                "timestamp": now,
                "details": "Risk score calculated and customer prioritized.",
            },
        ],
    }