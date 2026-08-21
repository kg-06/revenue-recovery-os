from fastapi import APIRouter
from app.services.gemini import generate_text

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/test")
async def test_ai():
    response = await generate_text(
        "In one sentence, explain what Revenue Recovery OS does."
    )

    return {"response": response}

@router.get("/status")
async def ai_status():
    return {
        "provider": "Gemini",
        "model": "gemini-2.5-flash",
        "status": "connected"
    }