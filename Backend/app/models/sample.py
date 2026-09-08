from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)

    # Barcode / Final Sample Code
    barcode = Column(String(255), unique=True, index=True, nullable=False)
    sample_code = Column(String(255), unique=True, index=True, nullable=False)

    # Existing sample type relationship
    sample_type_id = Column(
        Integer,
        ForeignKey("sample_types.id"),
        nullable=True
    )

    # Main sample name
    name = Column(String(150), nullable=False)

    # New reception / identification fields
    prof = Column(String(100), nullable=True)
    project = Column(String(100), nullable=True)
    trial = Column(String(100), nullable=True)
    site = Column(String(100), nullable=True)
    crop = Column(String(100), nullable=True)
    plot = Column(String(100), nullable=True)
    part = Column(String(100), nullable=True)
    collector = Column(String(100), nullable=True)
    dest = Column(String(100), nullable=True)

    # Reception date
    reception_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Workflow tracking
    current_stage_id = Column(
        Integer,
        ForeignKey("workflow_stages.id"),
        nullable=False
    )

    current_location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False
    )

    # Ownership / laboratory isolation
    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    laboratory_id = Column(
        Integer,
        ForeignKey("laboratories.id"),
        nullable=True
    )

    # Audit timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    laboratory = relationship(
        "Laboratory",
        back_populates="samples"
    )

    sample_type = relationship(
        "SampleType",
        back_populates="samples"
    )

    current_stage = relationship(
        "WorkflowStage",
        back_populates="current_samples"
    )

    current_location = relationship(
        "Location",
        back_populates="current_samples"
    )

    creator = relationship(
        "User",
        back_populates="created_samples",
        foreign_keys=[created_by]
    )

    movements = relationship(
        "SampleMovement",
        back_populates="sample",
        cascade="all, delete-orphan",
        order_by="SampleMovement.created_at.desc()"
    )