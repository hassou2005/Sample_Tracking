from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "TECHNICIAN"  # ADMIN, TECHNICIAN, or PROFESSOR
    is_active: bool = True


class UserCreate(BaseModel):
    username: Optional[str] = None
    email: EmailStr
    password: str
    laboratory_name: str
    role: str = "TECHNICIAN"  # TECHNICIAN or PROFESSOR for public creation
    is_active: bool = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    laboratory_id: Optional[int] = None
    laboratory_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    laboratory_id: Optional[int] = None
    laboratory_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    remember_me: bool = False


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse
