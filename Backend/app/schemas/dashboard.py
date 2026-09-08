from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RecentMovementItem(BaseModel):
    id: int
    sample_id: int
    sample_code: str
    sample_name: str
    from_stage: Optional[str] = None
    to_stage: str
    from_location: Optional[str] = None
    to_location: str
    movement_type: str
    technician_username: str
    comment: Optional[str] = None
    timestamp: datetime


class RecentSampleItem(BaseModel):
    id: int
    sample_code: str
    barcode: str
    name: str
    project: Optional[str] = None
    current_stage: str
    current_location: str
    created_at: datetime


class DashboardStatisticsResponse(BaseModel):
    total_projects: int = 0
    total_samples: int = 0
    samples_in_reception: int = 0
    samples_in_oven: int = 0
    samples_in_analysis: int = 0
    samples_in_storage: int = 0
    samples_created_today: int = 0
    movements_today: int = 0
    recent_movements: List[RecentMovementItem]
    recent_samples: List[RecentSampleItem]
