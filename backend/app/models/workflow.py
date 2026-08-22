from datetime import datetime
from typing import List

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    state: str
    timestamp: datetime
    details: str


class RecoveryWorkflow(BaseModel):
    payment_record_id: str

    current_state: str = "at_risk"

    timeline: List[TimelineEvent]

    recovered_amount: float = 0