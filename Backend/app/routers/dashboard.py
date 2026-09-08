from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.database.database import get_db
from app.models.sample import Sample
from app.models.workflow_stage import WorkflowStage
from app.models.sample_type import SampleType
from app.models.sample_movement import SampleMovement
from app.models.user import User
from app.schemas.dashboard import (
    DashboardStatisticsResponse, RecentMovementItem, RecentSampleItem
)
from app.core.dependencies import require_authenticated_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/statistics", response_model=DashboardStatisticsResponse)
@router.get("/stats", response_model=DashboardStatisticsResponse)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    """
    Computes and returns real-time laboratory metrics filtered strictly by the authenticated user's laboratory:
    - Total samples in user's laboratory
    - Total unique projects in user's laboratory
    - Stage counts in user's laboratory
    - Today's volume counts in user's laboratory
    - Recent movements & samples in user's laboratory
    """
    lab_id = current_user.laboratory_id

    # 1. Total samples in laboratory
    total_samples = db.query(Sample).filter(Sample.laboratory_id == lab_id).count()

    # 2. Total unique projects in laboratory (insensible aux espaces et à la casse)
    total_projects = (
        db.query(func.count(func.distinct(func.upper(func.trim(Sample.project)))))
        .filter(
            Sample.laboratory_id == lab_id,
            Sample.project.isnot(None),
            Sample.project != "",
            Sample.project != "—"
        )
        .scalar() or 0
    )

    # 3. Stage distribution counts in laboratory
    stage_reception = db.query(WorkflowStage).filter(WorkflowStage.name == "RECEPTION").first()
    stage_oven = db.query(WorkflowStage).filter(WorkflowStage.name == "OVEN").first()
    stage_analysis = db.query(WorkflowStage).filter(WorkflowStage.name == "ANALYSIS").first()
    stage_storage = db.query(WorkflowStage).filter(WorkflowStage.name == "STORAGE").first()

    samples_in_reception = (
        db.query(Sample).filter(Sample.laboratory_id == lab_id, Sample.current_stage_id == stage_reception.id).count()
        if stage_reception else 0
    )
    samples_in_oven = (
        db.query(Sample).filter(Sample.laboratory_id == lab_id, Sample.current_stage_id == stage_oven.id).count()
        if stage_oven else 0
    )
    samples_in_analysis = (
        db.query(Sample).filter(Sample.laboratory_id == lab_id, Sample.current_stage_id == stage_analysis.id).count()
        if stage_analysis else 0
    )
    samples_in_storage = (
        db.query(Sample).filter(Sample.laboratory_id == lab_id, Sample.current_stage_id == stage_storage.id).count()
        if stage_storage else 0
    )

    # 4. Today's volume counts in laboratory
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    samples_created_today = db.query(Sample).filter(Sample.laboratory_id == lab_id, Sample.created_at >= today_start).count()
    movements_today = db.query(SampleMovement).join(Sample).filter(Sample.laboratory_id == lab_id, SampleMovement.created_at >= today_start).count()

    # 5. Recent movements in laboratory (last 5)
    recent_movement_records = (
        db.query(SampleMovement)
        .join(Sample)
        .filter(Sample.laboratory_id == lab_id)
        .order_by(SampleMovement.created_at.desc(), SampleMovement.id.desc())
        .limit(5)
        .all()
    )
    recent_movements = []
    for m in recent_movement_records:
        recent_movements.append({
            "id": m.id,
            "sample_id": m.sample_id,
            "sample_code": m.sample.sample_code if m.sample else "Unknown",
            "sample_name": m.sample.name if m.sample else "Unknown",
            "from_stage": m.from_stage.name if m.from_stage else None,
            "to_stage": m.to_stage.name if m.to_stage else "Unknown",
            "from_location": m.from_location.name if m.from_location else None,
            "to_location": m.to_location.name if m.to_location else "Unknown",
            "movement_type": m.movement_type,
            "technician_username": m.user.username if m.user else "Unknown",
            "comment": m.comment,
            "timestamp": m.created_at
        })

    # 6. Recent samples in laboratory (last 5)
    recent_sample_records = (
        db.query(Sample)
        .filter(Sample.laboratory_id == lab_id)
        .order_by(Sample.created_at.desc(), Sample.id.desc())
        .limit(5)
        .all()
    )
    recent_samples = []
    for s in recent_sample_records:
        recent_samples.append({
            "id": s.id,
            "sample_code": s.sample_code,
            "barcode": s.barcode,
            "name": s.name,
            "project": s.project,
            "current_stage": s.current_stage.name if s.current_stage else "Unknown",
            "current_location": s.current_location.name if s.current_location else "Unknown",
            "created_at": s.created_at
        })

    return {
        "total_projects": total_projects,
        "total_samples": total_samples,
        "samples_in_reception": samples_in_reception,
        "samples_in_oven": samples_in_oven,
        "samples_in_analysis": samples_in_analysis,
        "samples_in_storage": samples_in_storage,
        "samples_created_today": samples_created_today,
        "movements_today": movements_today,
        "recent_movements": recent_movements,
        "recent_samples": recent_samples
    }