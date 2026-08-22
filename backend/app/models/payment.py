from datetime import date
from pydantic import BaseModel, EmailStr, Field


class PaymentRecord(BaseModel):
    customer_name: str = Field(..., min_length=2)
    email: EmailStr
    amount: float = Field(..., gt=0)

    payment_type: str
    status: str
    failure_reason: str

    due_date: date
    attempts: int = Field(..., ge=0)

    risk_score: float = 0.0
    workflow_state: str = "at_risk"
    record_id: str = ""