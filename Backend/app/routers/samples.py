from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.sample import (
    SampleCreate,
    SampleUpdate,
    SampleResponse,
    PaginatedSampleResponse,
    SampleHistoryResponse
)
from app.core.dependencies import (
    require_technician,
    require_authenticated_user,
    require_admin
)
from app.services import sample_service


router = APIRouter(
    prefix="/api/samples",
    tags=["Samples"]
)


@router.post(
    "",
    response_model=SampleResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_sample(
    sample_in: SampleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_technician)
):
    """
    Register a new laboratory sample associated
    with the authenticated user's laboratory.
    """
    return sample_service.create_sample(
        db=db,
        sample_in=sample_in,
        creator_id=current_user.id,
        laboratory_id=current_user.laboratory_id
    )


@router.get(
    "",
    response_model=PaginatedSampleResponse
)
def list_samples(
    search: Optional[str] = Query(
        None,
        description="Search by barcode, sample code, sample name, or project"
    ),
    species: Optional[str] = Query(
        None,
        description="Filter by biological species"
    ),
    sample_type_id: Optional[int] = Query(
        None,
        description="Filter by sample type ID"
    ),
    stage_id: Optional[int] = Query(
        None,
        description="Filter by workflow stage ID"
    ),
    location_id: Optional[int] = Query(
        None,
        description="Filter by physical location ID"
    ),
    page: int = Query(
        1,
        ge=1,
        description="Page number"
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
        description="Items per page"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """
    List laboratory samples filtered strictly
    by the authenticated user's laboratory.
    """
    return sample_service.get_samples_paginated(
        db=db,
        laboratory_id=current_user.laboratory_id,
        search_filter=search,
        species_filter=species,
        sample_type_id=sample_type_id,
        stage_id=stage_id,
        location_id=location_id,
        page=page,
        limit=limit
    )


@router.get(
    "/barcode/{barcode}",
    response_model=SampleResponse
)
def get_sample_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """
    Retrieve detailed sample record enforcing
    laboratory isolation.
    """
    return sample_service.get_sample_by_barcode(
        db,
        barcode,
        laboratory_id=current_user.laboratory_id
    )


@router.get(
    "/{id}",
    response_model=SampleResponse
)
def get_sample_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """
    Retrieve detailed sample record by ID or sample code
    enforcing laboratory isolation.
    """
    return sample_service.get_sample_by_id(
        db,
        id,
        laboratory_id=current_user.laboratory_id
    )


@router.get(
    "/{id}/history",
    response_model=SampleHistoryResponse
)
def get_sample_traceability_history(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """
    Retrieve full sample details and movement history
    enforcing laboratory isolation.
    """
    return sample_service.get_sample_history(
        db,
        id,
        laboratory_id=current_user.laboratory_id
    )


@router.put(
    "/{id}",
    response_model=SampleResponse
)
def update_sample_metadata(
    id: int,
    sample_update: SampleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_technician)
):
    """
    Update sample metadata enforcing laboratory isolation.
    """
    return sample_service.update_sample(
        db,
        id,
        sample_update,
        laboratory_id=current_user.laboratory_id
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_sample_record(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Permanently delete a sample record enforcing
    laboratory isolation (Admin only).
    """
    sample_service.delete_sample(
        db,
        id,
        laboratory_id=current_user.laboratory_id
    )
    return None