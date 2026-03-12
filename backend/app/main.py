
from fastapi import FastAPI
from .routers import sessions

app = FastAPI(title="Time Manager API")

app.include_router(sessions.router)
