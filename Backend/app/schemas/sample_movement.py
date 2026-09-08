from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.workflow_stage import WorkflowStageResponse
from app.schemas.location import LocationResponse
from app.schemas.user import UserResponse


class SampleMovementBase(BaseModel):
    sample_id: int
    from_stage_id: Optional[int] = None
    to_stage_id: int
    from_location_id: Optional[int] = None
    to_location_id: int
    movement_type: str
    comment: Optional[str] = None


class SampleMovementCreate(SampleMovementBase):
    pass


class SampleInfo(BaseModel):
    id: int
    sample_code: str
    barcode: Optional[str] = None
    name: Optional[str] = None

    class Config:
        from_attributes = True


class SampleMovementResponse(SampleMovementBase):
    id: int
    user_id: int
    created_at: datetime

    sample: Optional[SampleInfo] = None

    from_stage: Optional[WorkflowStageResponse] = None
    to_stage: Optional[WorkflowStageResponse] = None
    from_location: Optional[LocationResponse] = None
    to_location: Optional[LocationResponse] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class ScanRequest(BaseModel):
    barcode: str


class ScanResponse(BaseModel):
    success: bool
    movement_type: str
    previous_stage: str
    new_stage: str
    sample_code: str
    sample_id: Optional[int] = None


class ManualMovementRequest(BaseModel):
    barcode: str
    to_stage_id: int
    to_location_id: Optional[int] = None
    comment: Optional[str] = "Scanner unavailable"


class AdminCorrectionRequest(BaseModel):
    barcode: str
    to_stage_id: int
    to_location_id: Optional[int] = None
    comment: str