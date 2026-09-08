from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse

router = APIRouter(prefix="/api/locations", tags=["Locations"])


@router.get("", response_model=List[LocationResponse])
def get_locations(db: Session = Depends(get_db)):
    """List all active physical locations."""
    return db.query(Location).filter(Location.is_active == True).all()
