from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import Base, SessionLocal, engine
from app.models import models as _models  # noqa: F401 - ensures SQLAlchemy metadata is loaded
from app.routers import entries, preferences, sessions
from app.services import ensure_demo_user


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        ensure_demo_user(db)
    yield


app = FastAPI(title="Time Manager API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)  # /api/*
app.include_router(entries.router)  # /api/*
app.include_router(preferences.router)  # /api/*
@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/health")
def api_healthcheck() -> dict[str, str]:
    return {"status": "ok"}
