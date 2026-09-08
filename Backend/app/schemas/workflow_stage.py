from pydantic import BaseModel
from typing import Optional


class WorkflowStageBase(BaseModel):
    name: str
    description: Optional[str] = None
    stage_order: int
    is_active: bool = True


class WorkflowStageCreate(WorkflowStageBase):
    pass


class WorkflowStageResponse(WorkflowStageBase):
    id: int

    class Config:
        from_attributes = True
