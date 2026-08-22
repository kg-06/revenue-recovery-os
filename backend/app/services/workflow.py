from datetime import datetime


def create_initial_workflow(payment_id: str):
    return {
        "payment_record_id": payment_id,
        "current_state": "at_risk",
        "recovered_amount": 0,
        "timeline": [
            {
                "state": "at_risk",
                "timestamp": datetime.utcnow(),
                "details": "Payment imported and marked as revenue at risk.",
            }
        ],
    }