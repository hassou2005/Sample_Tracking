from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    current_samples = relationship("Sample", back_populates="current_location")
    movements_from = relationship("SampleMovement", back_populates="from_location", foreign_keys="SampleMovement.from_location_id")
    movements_to = relationship("SampleMovement", back_populates="to_location", foreign_keys="SampleMovement.to_location_id")
