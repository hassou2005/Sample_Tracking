from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.workflow_stage import WorkflowStage
from app.schemas.workflow_stage import WorkflowStageResponse

router = APIRouter(prefix="/api/workflow-stages", tags=["Workflow Stages"])


@router.get("", response_model=List[WorkflowStageResponse])
def get_workflow_stages(db: Session = Depends(get_db)):
    """List all configured workflow stages in sequence order."""
    return db.query(WorkflowStage).order_by(WorkflowStage.stage_order.asc()).all()
