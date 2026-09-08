from pydantic import BaseModel
from typing import Optional


class SampleTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class SampleTypeCreate(SampleTypeBase):
    pass


class SampleTypeResponse(SampleTypeBase):
    id: int

    class Config:
        from_attributes = True
