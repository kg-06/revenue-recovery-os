from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.database import db
from app.api.ai import router as ai_router
from app.api.upload import router as upload_router
from app.api.dashboard import router as dashboard_router
from app.api.recovery import router as recovery_router
from app.api.diagnosis import router as diagnosis_router
from app.api.workflow import router as workflow_router
from app.api.email import router as email_router
from app.api.recovery_action import router as recovery_action_router
from app.api.payment import router as payment_router

app = FastAPI(
    title="Revenue Recovery OS API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(ai_router)
app.include_router(upload_router)
app.include_router(dashboard_router)
app.include_router(recovery_router)
app.include_router(diagnosis_router)
app.include_router(workflow_router)
app.include_router(email_router)
app.include_router(recovery_action_router)
app.include_router(payment_router)

@app.get("/")
async def root():
    return {"message": "Revenue Recovery OS API is running."}

@app.get("/health")
async def health():
    try:
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": str(e)
        }