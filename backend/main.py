"""
main.py — ASTRA FastAPI application entry point.

Run with: uvicorn backend.main:app --reload
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.scan import router as scan_router
from .api.history import router as history_router
from .database import database, create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(
    title="ASTRA — AST-Based Accessibility Review Tool",
    description="Scan React/HTML code for WCAG accessibility issues",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)
app.include_router(history_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "astra", "version": "2.0.0"}
