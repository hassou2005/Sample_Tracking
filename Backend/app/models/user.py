from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="TECHNICIAN")  # ADMIN, TECHNICIAN, or PROFESSOR
    laboratory_id = Column(Integer, ForeignKey("laboratories.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    laboratory = relationship("Laboratory", back_populates="users")
    created_samples = relationship("Sample", back_populates="creator", foreign_keys="Sample.created_by")
    movements = relationship("SampleMovement", back_populates="user")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

    @property
    def case_insensitive_email(self):
        return self.email.lower() if self.email else None
