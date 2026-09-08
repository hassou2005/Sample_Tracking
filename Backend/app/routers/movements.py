from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.sample_movement import (
    SampleMovementResponse, ManualMovementRequest, AdminCorrectionRequest
)
from app.core.dependencies import require_technician, require_admin, require_authenticated_user
from app.services import movement_service

router = APIRouter(prefix="/api/movements", tags=["Sample Movements"])


@router.get("", response_model=List[SampleMovementResponse])
def get_movements(
    sample_id: Optional[int] = Query(None, description="Filter movement logs by sample ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """Retrieve full movement history logs enforcing laboratory isolation."""
    return movement_service.get_movement_history(
        db,
        sample_id=sample_id,
        laboratory_id=current_user.laboratory_id
    )


@router.get("/sample/{sample_id}", response_model=List[SampleMovementResponse])
def get_sample_movements(
    sample_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """Retrieve movement history logs specifically for a given sample ID enforcing laboratory isolation."""
    return movement_service.get_movement_history(
        db,
        sample_id=sample_id,
        laboratory_id=current_user.laboratory_id
    )


@router.post("/manual", response_model=SampleMovementResponse, status_code=status.HTTP_201_CREATED)
def execute_manual_sample_movement(
    manual_in: ManualMovementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_technician)
):
    """
    Manual Fallback Movement Endpoint enforcing laboratory isolation.
    """
    is_admin = (current_user.role == "ADMIN")
    return movement_service.execute_manual_movement(
        db=db,
        barcode_val=manual_in.barcode,
        target_stage_id=manual_in.to_stage_id,
        target_location_id=manual_in.to_location_id,
        user_id=current_user.id,
        laboratory_id=current_user.laboratory_id,
        comment=manual_in.comment,
        is_admin=is_admin
    )


@router.post("/admin-correction", response_model=SampleMovementResponse, status_code=status.HTTP_201_CREATED)
def execute_administrative_correction(
    correction_in: AdminCorrectionRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    Exceptional Administrative Correction Endpoint enforcing laboratory isolation.
    """
    return movement_service.execute_admin_correction(
        db=db,
        barcode_val=correction_in.barcode,
        target_stage_id=correction_in.to_stage_id,
        target_location_id=correction_in.to_location_id,
        user_id=admin_user.id,
        laboratory_id=admin_user.laboratory_id,
        comment=correction_in.comment
    )