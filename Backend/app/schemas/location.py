from pydantic import BaseModel
from typing import Optional


class LocationBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    id: int

    class Config:
        from_attributes = True
