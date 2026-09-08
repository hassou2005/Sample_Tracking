from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

from app.schemas.sample_type import SampleTypeResponse
from app.schemas.workflow_stage import WorkflowStageResponse
from app.schemas.location import LocationResponse
from app.schemas.user import UserResponse


class SampleBase(BaseModel):
    """
    Base schema for laboratory samples.

    The new reception fields are intentionally free-text fields.
    """

    # Main sample information
    name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    # Kept for compatibility with the existing application.
    # It is now optional because the new reception form does not
    # necessarily select a predefined sample type.
    sample_type_id: Optional[int] = None

    # New reception / identification fields
    prof: Optional[str] = Field(
        default=None,
        max_length=100
    )

    project: Optional[str] = Field(
        default=None,
        max_length=100
    )

    trial: Optional[str] = Field(
        default=None,
        max_length=100
    )

    site: Optional[str] = Field(
        default=None,
        max_length=100
    )

    crop: Optional[str] = Field(
        default=None,
        max_length=100
    )

    plot: Optional[str] = Field(
        default=None,
        max_length=100
    )

    part: Optional[str] = Field(
        default=None,
        max_length=100
    )

    collector: Optional[str] = Field(
        default=None,
        max_length=100
    )

    reception_date: Optional[datetime] = None

    dest: Optional[str] = Field(
        default=None,
        max_length=100
    )


class SampleCreate(BaseModel):
    """
    Schema used when registering a new laboratory sample.

    The creation form contains only the reception fields.
    The sample code and barcode are generated automatically
    by the backend after the database ID is created.
    """

    # ---------------------------------------------------------
    # Reception form fields
    # ---------------------------------------------------------

    name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    sample_type_id: Optional[int] = None

    prof: Optional[str] = Field(
        default=None,
        max_length=100
    )

    project: Optional[str] = Field(
        default=None,
        max_length=100
    )

    trial: Optional[str] = Field(
        default=None,
        max_length=100
    )

    site: Optional[str] = Field(
        default=None,
        max_length=100
    )

    crop: Optional[str] = Field(
        default=None,
        max_length=100
    )

    plot: Optional[str] = Field(
        default=None,
        max_length=100
    )

    part: Optional[str] = Field(
        default=None,
        max_length=100
    )

    collector: Optional[str] = Field(
        default=None,
        max_length=100
    )

    reception_date: Optional[datetime] = None

    dest: Optional[str] = Field(
        default=None,
        max_length=100
    )


class SampleUpdate(BaseModel):
    """
    Schema used to update editable sample metadata.
    """

    name: Optional[str] = None
    sample_type_id: Optional[int] = None

    # New fields
    prof: Optional[str] = None
    project: Optional[str] = None
    trial: Optional[str] = None
    site: Optional[str] = None
    crop: Optional[str] = None
    plot: Optional[str] = None
    part: Optional[str] = None
    collector: Optional[str] = None
    dest: Optional[str] = None
    reception_date: Optional[datetime] = None



class SampleResponse(SampleBase):
    """
    Complete sample response returned by the API.
    """

    id: int
    barcode: str
    sample_code: str
    barcode_url: Optional[str] = None
    # Reception date is guaranteed in the database.
    reception_date: datetime
    current_stage_id: int
    current_location_id: int
    created_by: int
    laboratory_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    # Existing relationships
    sample_type: Optional[SampleTypeResponse] = None

    current_stage: Optional[WorkflowStageResponse] = None

    current_location: Optional[LocationResponse] = None

    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class PaginatedSampleResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[SampleResponse]


class SampleMovementHistoryItem(BaseModel):
    id: int
    from_stage: Optional[WorkflowStageResponse] = None
    to_stage: WorkflowStageResponse
    from_location: Optional[LocationResponse] = None
    to_location: LocationResponse
    technician_username: str
    movement_type: str
    comment: Optional[str] = None
    timestamp: datetime


class SampleHistoryResponse(BaseModel):
    sample: SampleResponse
    current_stage: WorkflowStageResponse
    current_location: LocationResponse
    history: List[SampleMovementHistoryItem]