from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.database.init_db import init_db
from app.routers import (
    health,
    auth,
    users,
    sample_types,
    workflow_stages,
    locations,
    samples,
    movements,
    scanner,
    dashboard
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to initialize database schema and seed data on startup."""
    logger.info("Initializing ASARI Sample Tracking backend service...")
    try:
        init_db()
    except Exception as e:
        logger.error(f"Error during startup database initialization: {e}")
    yield


app = FastAPI(
    title="ASARI Sample Tracking API",
    description="Laboratory Sample Tracking & Traceability System Backend API — ASARI / UM6P",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure generated asset directories exist
os.makedirs("generated/barcodes", exist_ok=True)
os.makedirs("generated/labels", exist_ok=True)

# Clear old barcode cache so they are regenerated without the duplicate embedded text
try:
    barcode_dir = "generated/barcodes"
    if os.path.exists(barcode_dir):
        cleared_count = 0
        for f in os.listdir(barcode_dir):
            if f.endswith(".png"):
                os.remove(os.path.join(barcode_dir, f))
                cleared_count += 1
        if cleared_count > 0:
            logger.info(f"Cleared {cleared_count} old cached barcodes to ensure text-free regeneration.")
except Exception as e:
    logger.error(f"Error clearing barcode cache: {e}")

# Static file serving for generated barcodes/labels
app.mount("/static/barcodes", StaticFiles(directory="generated/barcodes"), name="barcodes")
app.mount("/static/labels", StaticFiles(directory="generated/labels"), name="labels")

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sample_types.router)
app.include_router(workflow_stages.router)
app.include_router(locations.router)
app.include_router(samples.router)
app.include_router(movements.router)
app.include_router(scanner.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "status": "online",
        "system": "ASARI Sample Tracking — Laboratory Sample Tracking & Traceability System",
        "version": "1.0.0",
        "organization": "ASARI — UM6P",
        "language": "English"
    }
