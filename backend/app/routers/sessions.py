
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/sessions", tags=["sessions"])

active_session = None

@router.post("/start")
def start_session():
    global active_session
    active_session = datetime.utcnow()
    return {"status": "started", "start_time": str(active_session)}

@router.post("/stop")
def stop_session():
    global active_session
    if not active_session:
        return {"error": "no active session"}
    duration = datetime.utcnow() - active_session
    active_session = None
    return {"status": "stopped", "duration_seconds": duration.total_seconds()}
