from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class Laboratory(Base):
    __tablename__ = "laboratories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False) # <-- Ajoutez default et onupdate
    # Relationships
    users = relationship("User", back_populates="laboratory")
    samples = relationship("Sample", back_populates="laboratory")
    
    # Add missing relationship targeting SampleMovement
    sample_movements = relationship("SampleMovement", back_populates="laboratory")
    is_active = Column(Boolean, default=True, nullable=False)