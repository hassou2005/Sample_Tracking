from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.database import Base


class WorkflowStage(Base):
    __tablename__ = "workflow_stages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    stage_order = Column(Integer, unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    current_samples = relationship("Sample", back_populates="current_stage")
    movements_from = relationship("SampleMovement", back_populates="from_stage", foreign_keys="SampleMovement.from_stage_id")
    movements_to = relationship("SampleMovement", back_populates="to_stage", foreign_keys="SampleMovement.to_stage_id")
