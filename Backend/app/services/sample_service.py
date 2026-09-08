from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import math
import uuid

from app.models.sample import Sample
from app.models.sample_type import SampleType
from app.models.workflow_stage import WorkflowStage
from app.models.location import Location
from app.models.sample_movement import SampleMovement
from app.schemas.sample import SampleCreate, SampleUpdate
from app.services.barcode_service import (
    generate_barcode,
    BarcodeGenerationError
)


def _clean_value(value: Optional[Any]) -> str:
    """
    Convert a field to a clean string.

    None becomes an empty string.
    Leading/trailing spaces are removed.
    """

    if value is None:
        return ""

    return str(value).strip()


def generate_final_sample_code(
    sample_in: SampleCreate,
    sample_id: int
) -> str:
    """
    Generate the fallback ASARI laboratory sample code if no custom final code is provided.

    Format:
        SMP-YYYY-00000000

    Example:
        SMP-2026-00000088
    """

    if sample_in.reception_date:
        year = sample_in.reception_date.year
    else:
        year = datetime.utcnow().year

    return f"SMP-{year}-{sample_id:08d}"


def create_sample(
    db: Session,
    sample_in: SampleCreate,
    creator_id: int,
    laboratory_id: Optional[int] = None
) -> Sample:
    """
    Validate and register a new laboratory sample.

    The final sample code and barcode are set from the payload final code
    or generated as fallback.
    """

    # ---------------------------------------------------------
    # 1. Validate sample type only when provided
    # ---------------------------------------------------------

    print("DEBUG sample_type_id =", sample_in.sample_type_id)

    sample_type = None

    if sample_in.sample_type_id is not None:
        sample_type = (
            db.query(SampleType)
            .filter(
                SampleType.id == sample_in.sample_type_id,
                SampleType.is_active == True
            )
            .first()
        )

        if not sample_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid or inactive sample type ID "
                    f"'{sample_in.sample_type_id}'."
                )
            )

    # ---------------------------------------------------------
    # 2. Find initial workflow stage
    # ---------------------------------------------------------

    initial_stage = (
        db.query(WorkflowStage)
        .filter(
            or_(
                WorkflowStage.name == "RECEPTION",
                WorkflowStage.stage_order == 1
            )
        )
        .first()
    )

    if not initial_stage:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Default initial workflow stage "
                "'RECEPTION' is not configured."
            )
        )

    # ---------------------------------------------------------
    # 3. Find initial physical location
    # ---------------------------------------------------------

    initial_location = (
        db.query(Location)
        .filter(
            Location.name == "Reception Area"
        )
        .first()
    )

    if not initial_location:
        initial_location = (
            db.query(Location)
            .filter(
                Location.is_active == True
            )
            .first()
        )

        if not initial_location:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Default initial location "
                    "'Reception Area' is not configured."
                )
            )

    # ---------------------------------------------------------
    # 4. Determine reception date
    # ---------------------------------------------------------

    reception_datetime = (
        sample_in.reception_date
        if sample_in.reception_date
        else datetime.utcnow()
    )

    # ---------------------------------------------------------
    # 5. Create database record
    # ---------------------------------------------------------

    try:
        new_sample = Sample(
            barcode=f"PENDING-{uuid.uuid4()}",
            sample_code=f"PENDING-{uuid.uuid4()}",

            sample_type_id=(
                sample_type.id
                if sample_type
                else None
            ),

            # Main information
            name=sample_in.name.strip(),

            # New reception fields
            prof=_clean_value(sample_in.prof) or None,
            project=_clean_value(sample_in.project) or None,
            trial=_clean_value(sample_in.trial) or None,
            site=_clean_value(sample_in.site) or None,
            crop=_clean_value(sample_in.crop) or None,
            plot=_clean_value(sample_in.plot) or None,
            part=_clean_value(sample_in.part) or None,
            collector=_clean_value(sample_in.collector) or None,
            dest=_clean_value(sample_in.dest) or None,

            reception_date=reception_datetime,

            # Workflow
            current_stage_id=initial_stage.id,
            current_location_id=initial_location.id,

            # Ownership
            created_by=creator_id,
            laboratory_id=laboratory_id
        )

        db.add(new_sample)

        # Generate ID before creating movement
        db.flush()

        # ---------------------------------------------------------
        # 6. Assign final sample code (Prioritize Final Code from frontend)
        # ---------------------------------------------------------

        raw_code = getattr(sample_in, "sample_code", None)
        if raw_code and str(raw_code).strip():
            sample_code = str(raw_code).strip()
        else:
            sample_code = generate_final_sample_code(
                sample_in,
                new_sample.id
            )

        # The final code is both the sample_code and barcode identifier
        new_sample.sample_code = sample_code
        new_sample.barcode = sample_code

        # ---------------------------------------------------------
        # 7. Generate Code 128 barcode image
        # ---------------------------------------------------------

        try:
            generate_barcode(
                sample_code=sample_code,
                sample_name=new_sample.name
            )

        except BarcodeGenerationError as bge:
            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Failed to generate physical barcode asset: "
                    f"{str(bge)}"
                )
            )

        # ---------------------------------------------------------
        # 8. Initial movement / reception record
        # ---------------------------------------------------------

        initial_movement = SampleMovement(
            sample_id=new_sample.id,
            from_stage_id=None,
            to_stage_id=initial_stage.id,
            from_location_id=None,
            to_location_id=initial_location.id,
            user_id=creator_id,
            movement_type="MANUAL",
            comment=(
                "Initial sample reception and "
                "tag registration."
            )
        )

        db.add(initial_movement)

        # -----------------------------------------------------
        # 9. Commit transaction
        # -----------------------------------------------------

        db.commit()

        db.refresh(new_sample)

        # -----------------------------------------------------
        # 10. Barcode URL
        # -----------------------------------------------------

        new_sample.barcode_url = (
            f"/static/barcodes/"
            f"{new_sample.barcode}.png"
        )

        return new_sample

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not persist sample record: "
                f"{str(e)}"
            )
        )


def get_samples_paginated(
    db: Session,
    laboratory_id: Optional[int] = None,
    search_filter: Optional[str] = None,
    species_filter: Optional[str] = None,
    sample_type_id: Optional[int] = None,
    stage_id: Optional[int] = None,
    location_id: Optional[int] = None,
    page: int = 1,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Retrieve samples with multi-attribute filtering
    and laboratory isolation.
    """

    query = db.query(Sample)

    if laboratory_id is not None:
        query = query.filter(
            Sample.laboratory_id == laboratory_id
        )

    if search_filter:
        search_term = search_filter.strip()

        query = query.filter(
            or_(
                Sample.barcode.ilike(
                    f"%{search_term}%"
                ),
                Sample.sample_code.ilike(
                    f"%{search_term}%"
                ),
                Sample.name.ilike(
                    f"%{search_term}%"
                ),
                Sample.project.ilike(
                    f"%{search_term}%"
                )
            )
        )

    if species_filter:
        query = query.filter(
            Sample.species.ilike(
                f"%{species_filter.strip()}%"
            )
        )

    if sample_type_id:
        query = query.filter(
            Sample.sample_type_id == sample_type_id
        )

    if stage_id:
        query = query.filter(
            Sample.current_stage_id == stage_id
        )

    if location_id:
        query = query.filter(
            Sample.current_location_id == location_id
        )

    total = query.count()

    pages = (
        math.ceil(total / limit)
        if total > 0
        else 1
    )

    offset = (page - 1) * limit

    items = (
        query
        .order_by(Sample.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    for item in items:
        item.barcode_url = (
            f"/static/barcodes/"
            f"{item.barcode}.png"
        )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
        "items": items
    }


def get_sample_by_id(
    db: Session,
    sample_id: Any,
    laboratory_id: Optional[int] = None
) -> Sample:
    """
    Retrieve a single sample by primary key ID
    or sample code string.
    """

    cleaned = str(sample_id).strip()

    sample = None

    if cleaned.isdigit():
        sample = (
            db.query(Sample)
            .filter(
                Sample.id == int(cleaned)
            )
            .first()
        )

    if not sample:
        sample = (
            db.query(Sample)
            .filter(
                or_(
                    Sample.barcode == cleaned,
                    Sample.sample_code == cleaned
                )
            )
            .first()
        )

    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Sample '{sample_id}' was not found."
            )
        )

    if (
        laboratory_id is not None
        and sample.laboratory_id != laboratory_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Access denied. Sample belongs "
                "to another laboratory."
            )
        )

    sample.barcode_url = (
        f"/static/barcodes/"
        f"{sample.barcode}.png"
    )

    return sample


def get_sample_by_barcode(
    db: Session,
    barcode_val: str,
    laboratory_id: Optional[int] = None
) -> Sample:
    """
    Retrieve a single sample by unique barcode
    or sample code.
    """

    cleaned = barcode_val.strip()

    sample = (
        db.query(Sample)
        .filter(
            or_(
                Sample.barcode == cleaned,
                Sample.sample_code == cleaned
            )
        )
        .first()
    )

    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Sample with barcode "
                f"'{cleaned}' was not found."
            )
        )

    if (
        laboratory_id is not None
        and sample.laboratory_id != laboratory_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Access denied. Sample belongs "
                "to another laboratory."
            )
        )

    sample.barcode_url = (
        f"/static/barcodes/"
        f"{sample.barcode}.png"
    )

    return sample


def update_sample(
    db: Session,
    sample_id: int,
    sample_update: SampleUpdate,
    laboratory_id: Optional[int] = None
) -> Sample:
    """
    Updates editable sample metadata while
    enforcing laboratory isolation.
    """

    sample = get_sample_by_id(
        db,
        sample_id,
        laboratory_id=laboratory_id
    )

    # ---------------------------------------------------------
    # Existing sample type
    # ---------------------------------------------------------

    if sample_update.sample_type_id is not None:
        st = (
            db.query(SampleType)
            .filter(
                SampleType.id == sample_update.sample_type_id,
                SampleType.is_active == True
            )
            .first()
        )

        if not st:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid or inactive sample type ID "
                    f"'{sample_update.sample_type_id}'."
                )
            )

        sample.sample_type_id = st.id

    # ---------------------------------------------------------
    # Main information
    # ---------------------------------------------------------

    if sample_update.name is not None:
        sample.name = sample_update.name.strip()

    # ---------------------------------------------------------
    # New reception fields
    # ---------------------------------------------------------

    if sample_update.prof is not None:
        sample.prof = (
            sample_update.prof.strip()
            if sample_update.prof
            else None
        )

    if sample_update.project is not None:
        sample.project = (
            sample_update.project.strip()
            if sample_update.project
            else None
        )

    if sample_update.trial is not None:
        sample.trial = (
            sample_update.trial.strip()
            if sample_update.trial
            else None
        )

    if sample_update.site is not None:
        sample.site = (
            sample_update.site.strip()
            if sample_update.site
            else None
        )

    if sample_update.crop is not None:
        sample.crop = (
            sample_update.crop.strip()
            if sample_update.crop
            else None
        )

    if sample_update.plot is not None:
        sample.plot = (
            sample_update.plot.strip()
            if sample_update.plot
            else None
        )

    if sample_update.part is not None:
        sample.part = (
            sample_update.part.strip()
            if sample_update.part
            else None
        )

    if sample_update.collector is not None:
        sample.collector = (
            sample_update.collector.strip()
            if sample_update.collector
            else None
        )

    if sample_update.dest is not None:
        sample.dest = (
            sample_update.dest.strip()
            if sample_update.dest
            else None
        )

    if sample_update.reception_date is not None:
        sample.reception_date = (
            sample_update.reception_date
        )

    # ---------------------------------------------------------
    # Existing fields
    # ---------------------------------------------------------

    if sample_update.species is not None:
        sample.species = (
            sample_update.species.strip()
            if sample_update.species
            else None
        )

    if sample_update.origin is not None:
        sample.origin = (
            sample_update.origin.strip()
            if sample_update.origin
            else None
        )

    if sample_update.collection_date is not None:
        sample.collection_date = (
            sample_update.collection_date
        )

    sample.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(sample)

    sample.barcode_url = (
        f"/static/barcodes/"
        f"{sample.barcode}.png"
    )

    return sample


def delete_sample(
    db: Session,
    sample_id: int,
    laboratory_id: Optional[int] = None
) -> bool:
    """
    Permanently delete a sample record while
    enforcing laboratory isolation.
    """

    sample = get_sample_by_id(
        db,
        sample_id,
        laboratory_id=laboratory_id
    )

    db.delete(sample)
    db.commit()

    return True


def get_sample_history(
    db: Session,
    sample_id: int,
    laboratory_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Retrieve comprehensive sample details and
    chronological history.
    """

    sample = get_sample_by_id(
        db,
        sample_id,
        laboratory_id=laboratory_id
    )

    movements = (
        db.query(SampleMovement)
        .filter(
            SampleMovement.sample_id == sample.id
        )
        .order_by(
            SampleMovement.created_at.asc(),
            SampleMovement.id.asc()
        )
        .all()
    )

    history_items = []

    for m in movements:
        history_items.append(
            {
                "id": m.id,
                "from_stage": m.from_stage,
                "to_stage": m.to_stage,
                "from_location": m.from_location,
                "to_location": m.to_location,
                "technician_username": (
                    m.user.username
                    if m.user
                    else "System"
                ),
                "movement_type": m.movement_type,
                "comment": m.comment,
                "timestamp": m.created_at
            }
        )

    return {
        "sample": sample,
        "current_stage": sample.current_stage,
        "current_location": sample.current_location,
        "history": history_items
    }