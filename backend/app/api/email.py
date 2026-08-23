from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.email_service import send_recovery_email

router = APIRouter(prefix="/email", tags=["Email"])


class EmailRequest(BaseModel):
    email: str
    name: str


@router.post("/test")
async def send_test_email(request: EmailRequest):
    try:
        result = await send_recovery_email(
            to_email=request.email,
            customer_name=request.name,
            subject="Revenue Recovery OS Test",
            html_content=f"""
            <h2>Hello {request.name}</h2>

            <p>Your Recovery OS email service is working correctly.</p>

            <p>This email was sent through Brevo.</p>
            """,
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )