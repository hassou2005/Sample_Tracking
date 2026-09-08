from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.sample_movement import ScanRequest, ScanResponse
from app.core.dependencies import require_technician
from app.services import movement_service

router = APIRouter(prefix="/api/scanner", tags=["Barcode Scanner"])


@router.post("/scan", response_model=ScanResponse)
def scan_barcode_and_advance(
    scan_in: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_technician)
):
    """
    Automatic Barcode Scan Endpoint enforcing laboratory isolation:
    - Identifies sample belonging to the user's laboratory and advances it automatically.
    - Rejects barcodes belonging to other laboratories with HTTP 403 Forbidden.
    """
    return movement_service.execute_automatic_scan_movement(
        db=db,
        barcode_val=scan_in.barcode,
        user_id=current_user.id,
        laboratory_id=current_user.laboratory_id
    )
