from pydantic import BaseModel, Field


class Diagnosis(BaseModel):
    root_cause: str = Field(..., description="Primary reason revenue is at risk")

    customer_behavior: str = Field(
        ...,
        description="Likely payment behavior"
    )

    recommended_strategy: str = Field(
        ...,
        description="Best recovery action"
    )

    confidence: float = Field(
        ...,
        ge=0,
        le=1
    )