from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status

from app.models.sample import Sample
from app.models.workflow_stage import WorkflowStage
from app.models.location import Location
from app.models.sample_movement import SampleMovement

STAGE_TO_LOCATION_MAP = {
    "RECEPTION": "Reception Area",
    "OVEN": "Oven Area",
    "ANALYSIS": "Laboratory",
    "STORAGE": "Storage Area"
}


def execute_automatic_scan_movement(
    db: Session,
    barcode_val: str,
    user_id: int,
    laboratory_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Automatic Barcode Scan Movement:
    Enforces strict laboratory isolation on barcode scanning.
    """
    cleaned_code = barcode_val.strip() if barcode_val else ""
    if not cleaned_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Barcode value must not be empty."
        )

    # 1. Fetch sample
    sample = db.query(Sample).filter(
        or_(Sample.barcode == cleaned_code, Sample.sample_code == cleaned_code)
    ).first()

    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample with barcode '{cleaned_code}' was not found."
        )

    # Laboratory Isolation Check
    if laboratory_id is not None and sample.laboratory_id != laboratory_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Sample belongs to another laboratory."
        )

    current_stage = sample.current_stage
    current_location = sample.current_location

    if not current_stage:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sample current stage state is invalid or unassigned."
        )

    # 2. Determine next sequential stage
    next_stage = (
        db.query(WorkflowStage)
        .filter(WorkflowStage.stage_order == current_stage.stage_order + 1)
        .first()
    )

    if not next_stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This sample has already reached the final stage."
        )

    # 3. Determine corresponding target location
    target_location_name = STAGE_TO_LOCATION_MAP.get(next_stage.name, "Storage Area")
    target_location = db.query(Location).filter(Location.name == target_location_name).first()
    if not target_location:
        target_location = db.query(Location).filter(Location.is_active == True).first()

    if not target_location:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not resolve location for target stage '{next_stage.name}'."
        )

    # 4. Perform atomic update & log creation
    try:
        from_stage_name = current_stage.name
        from_stage_id = current_stage.id
        from_location_id = current_location.id if current_location else target_location.id

        sample.current_stage_id = next_stage.id
        sample.current_location_id = target_location.id
        sample.updated_at = datetime.utcnow()

        movement_log = SampleMovement(
            sample_id=sample.id,
            from_stage_id=from_stage_id,
            to_stage_id=next_stage.id,
            from_location_id=from_location_id,
            to_location_id=target_location.id,
            user_id=user_id,
            movement_type="AUTOMATIC_SCAN",
            comment=f"Automatically advanced from {from_stage_name} to {next_stage.name} via barcode scan."
        )
        db.add(movement_log)

        db.commit()
        db.refresh(sample)

        return {
            "success": True,
            "movement_type": "AUTOMATIC_SCAN",
            "previous_stage": from_stage_name,
            "new_stage": next_stage.name,
            "sample_code": sample.sample_code,
            "sample_id": sample.id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not execute automatic movement transaction: {str(e)}"
        )


def execute_manual_movement(
    db: Session,
    barcode_val: str,
    target_stage_id: int,
    user_id: int,
    laboratory_id: Optional[int] = None,
    target_location_id: Optional[int] = None,
    comment: Optional[str] = None,
    is_admin: bool = False
) -> SampleMovement:
    """
    Manual Fallback Movement enforcing laboratory isolation.
    """
    cleaned_code = barcode_val.strip() if barcode_val else ""
    if not cleaned_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Barcode value must not be empty."
        )

    sample = db.query(Sample).filter(
        or_(Sample.barcode == cleaned_code, Sample.sample_code == cleaned_code)
    ).first()

    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample with barcode '{cleaned_code}' was not found."
        )

    # Laboratory Isolation Check
    if laboratory_id is not None and sample.laboratory_id != laboratory_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Sample belongs to another laboratory."
        )

    current_stage = sample.current_stage
    current_location = sample.current_location

    target_stage = db.query(WorkflowStage).filter(WorkflowStage.id == target_stage_id).first()
    if not target_stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid target workflow stage ID '{target_stage_id}'."
        )

    if not is_admin:
        if target_stage.stage_order != current_stage.stage_order + 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid workflow stage transition for technician. Normal workflow must advance sequentially to the next stage. Contact an administrator for exceptional corrections."
            )

    if target_location_id:
        target_location = db.query(Location).filter(Location.id == target_location_id).first()
        if not target_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target physical location ID '{target_location_id}'."
            )
    else:
        target_loc_name = STAGE_TO_LOCATION_MAP.get(target_stage.name, "Storage Area")
        target_location = db.query(Location).filter(Location.name == target_loc_name).first()
        if not target_location:
            target_location = db.query(Location).filter(Location.is_active == True).first()

    try:
        from_stage_id = sample.current_stage_id
        from_location_id = sample.current_location_id

        sample.current_stage_id = target_stage.id
        sample.current_location_id = target_location.id
        sample.updated_at = datetime.utcnow()

        movement = SampleMovement(
            sample_id=sample.id,
            from_stage_id=from_stage_id,
            to_stage_id=target_stage.id,
            from_location_id=from_location_id,
            to_location_id=target_location.id,
            user_id=user_id,
            movement_type="MANUAL",
            comment=comment or "Scanner unavailable"
        )
        db.add(movement)

        db.commit()
        db.refresh(movement)
        return movement

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not execute manual movement transaction: {str(e)}"
        )


def execute_admin_correction(
    db: Session,
    barcode_val: str,
    target_stage_id: int,
    user_id: int,
    comment: str,
    laboratory_id: Optional[int] = None,
    target_location_id: Optional[int] = None
) -> SampleMovement:
    """
    Exceptional Administrative Correction enforcing laboratory isolation.
    """
    if not comment or not comment.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A comment explaining the administrative correction is required."
        )

    cleaned_code = barcode_val.strip() if barcode_val else ""
    sample = db.query(Sample).filter(
        or_(Sample.barcode == cleaned_code, Sample.sample_code == cleaned_code)
    ).first()

    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample with barcode '{cleaned_code}' was not found."
        )

    # Laboratory Isolation Check
    if laboratory_id is not None and sample.laboratory_id != laboratory_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Sample belongs to another laboratory."
        )

    target_stage = db.query(WorkflowStage).filter(WorkflowStage.id == target_stage_id).first()
    if not target_stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid target workflow stage ID '{target_stage_id}'."
        )

    if target_location_id:
        target_location = db.query(Location).filter(Location.id == target_location_id).first()
        if not target_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target physical location ID '{target_location_id}'."
            )
    else:
        target_loc_name = STAGE_TO_LOCATION_MAP.get(target_stage.name, "Storage Area")
        target_location = db.query(Location).filter(Location.name == target_loc_name).first()
        if not target_location:
            target_location = db.query(Location).filter(Location.is_active == True).first()

    try:
        from_stage_id = sample.current_stage_id
        from_location_id = sample.current_location_id

        sample.current_stage_id = target_stage.id
        sample.current_location_id = target_location.id
        sample.updated_at = datetime.utcnow()

        movement = SampleMovement(
            sample_id=sample.id,
            from_stage_id=from_stage_id,
            to_stage_id=target_stage.id,
            from_location_id=from_location_id,
            to_location_id=target_location.id,
            user_id=user_id,
            movement_type="ADMIN_CORRECTION",
            comment=comment.strip()
        )
        db.add(movement)

        db.commit()
        db.refresh(movement)
        return movement

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not execute administrative correction: {str(e)}"
        )

def get_movement_history(
    db: Session,
    sample_id: Optional[int] = None,
    laboratory_id: Optional[int] = None
) -> List[SampleMovement]:

    query = (
        db.query(SampleMovement)
        .join(Sample)
        .options(
            joinedload(SampleMovement.sample),
            joinedload(SampleMovement.from_stage),
            joinedload(SampleMovement.to_stage),
            joinedload(SampleMovement.from_location),
            joinedload(SampleMovement.to_location),
            joinedload(SampleMovement.user),
        )
    )

    if laboratory_id is not None:
        query = query.filter(
            Sample.laboratory_id == laboratory_id
        )

    if sample_id:
        query = query.filter(
            SampleMovement.sample_id == sample_id
        )

    return query.order_by(
        SampleMovement.created_at.desc()
    ).all()