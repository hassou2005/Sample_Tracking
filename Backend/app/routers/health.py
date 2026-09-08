from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def get_health():
    """Health check endpoint for monitoring status."""
    return {
        "status": "ok",
        "application": "ASARI Sample Tracking"
    }
