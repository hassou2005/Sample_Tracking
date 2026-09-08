from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class SampleMovement(Base):
    __tablename__ = "sample_movements"

    id = Column(Integer, primary_key=True, index=True)
    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=False)
    from_stage_id = Column(Integer, ForeignKey("workflow_stages.id"), nullable=True)
    to_stage_id = Column(Integer, ForeignKey("workflow_stages.id"), nullable=False)
    from_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    to_location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Laboratory foreign key
    laboratory_id = Column(Integer, ForeignKey("laboratories.id"), nullable=True)

    movement_type = Column(String(50), nullable=False)  # AUTOMATIC_SCAN, MANUAL, ADMIN_CORRECTION
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    sample = relationship("Sample", back_populates="movements")
    from_stage = relationship("WorkflowStage", foreign_keys=[from_stage_id], back_populates="movements_from")
    to_stage = relationship("WorkflowStage", foreign_keys=[to_stage_id], back_populates="movements_to")
    from_location = relationship("Location", foreign_keys=[from_location_id], back_populates="movements_from")
    to_location = relationship("Location", foreign_keys=[to_location_id], back_populates="movements_to")
    user = relationship("User", back_populates="movements")
    
    # Relationship to Laboratory with explicit back_populates
    laboratory = relationship("Laboratory", back_populates="sample_movements")