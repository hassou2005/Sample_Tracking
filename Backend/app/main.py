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

# Enable CORS for development & Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise toutes les origines pour éviter les blocages CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redirection vers /tmp pour Vercel (système de fichiers en lecture seule)
BASE_GEN_DIR = "/tmp/generated" if os.environ.get("VERCEL") else "generated"
BARCODE_DIR = os.path.join(BASE_GEN_DIR, "barcodes")
LABEL_DIR = os.path.join(BASE_GEN_DIR, "labels")

# Ensure generated asset directories exist
os.makedirs(BARCODE_DIR, exist_ok=True)
os.makedirs(LABEL_DIR, exist_ok=True)

# Clear old barcode cache so they are regenerated without the duplicate embedded text
try:
    if os.path.exists(BARCODE_DIR):
        cleared_count = 0
        for f in os.listdir(BARCODE_DIR):
            if f.endswith(".png"):
                os.remove(os.path.join(BARCODE_DIR, f))
                cleared_count += 1
        if cleared_count > 0:
            logger.info(f"Cleared {cleared_count} old cached barcodes to ensure text-free regeneration.")
except Exception as e:
    logger.error(f"Error clearing barcode cache: {e}")

# Static file serving for generated barcodes/labels
app.mount("/static/barcodes", StaticFiles(directory=BARCODE_DIR), name="barcodes")
app.mount("/static/labels", StaticFiles(directory=LABEL_DIR), name="labels")

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