from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.sample_type import SampleType
from app.schemas.sample_type import SampleTypeResponse

router = APIRouter(prefix="/api/sample-types", tags=["Sample Types"])


@router.get("", response_model=List[SampleTypeResponse])
def get_sample_types(db: Session = Depends(get_db)):
    """List all available sample types."""
    return db.query(SampleType).filter(SampleType.is_active == True).all()
