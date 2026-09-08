from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.core.dependencies import require_admin
from app.core.security import get_password_hash
from app.routers.auth import populate_user_lab_name

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """List registered users filtered strictly by the admin's laboratory."""
    users = (
        db.query(User)
        .filter(User.laboratory_id == admin_user.laboratory_id)
        .order_by(User.id.asc())
        .all()
    )
    return [populate_user_lab_name(u) for u in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Create a new user account within the admin's laboratory."""
    email_clean = user_in.email.strip().lower()
    username_clean = user_in.username.strip() if user_in.username else email_clean.split("@")[0]

    existing_username = db.query(User).filter(User.username == username_clean).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already in use."
        )

    existing_email = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already in use."
        )

    role_upper = user_in.role.upper().strip()
    if role_upper not in ["ADMIN", "TECHNICIAN", "PROFESSOR"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Role must be 'ADMIN', 'TECHNICIAN', or 'PROFESSOR'."
        )

    if not user_in.password or len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    new_user = User(
        username=username_clean,
        email=email_clean,
        password_hash=get_password_hash(user_in.password),
        role=role_upper,
        laboratory_id=admin_user.laboratory_id,
        is_active=user_in.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return populate_user_lab_name(new_user)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Retrieve user details by ID enforcing laboratory isolation."""
    user = (
        db.query(User)
        .filter(User.id == user_id, User.laboratory_id == admin_user.laboratory_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found in your laboratory."
        )
    return populate_user_lab_name(user)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Update user details enforcing laboratory isolation."""
    user = (
        db.query(User)
        .filter(User.id == user_id, User.laboratory_id == admin_user.laboratory_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found in your laboratory."
        )

    if user_update.username and user_update.username.strip() != user.username:
        existing = db.query(User).filter(User.username == user_update.username.strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already in use."
            )
        user.username = user_update.username.strip()

    if user_update.email and user_update.email.strip().lower() != user.email.lower():
        existing = db.query(User).filter(User.email.ilike(user_update.email.strip())).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already in use."
            )
        user.email = user_update.email.strip().lower()

    if user_update.role:
        role_upper = user_update.role.upper().strip()
        if role_upper not in ["ADMIN", "TECHNICIAN", "PROFESSOR"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Role must be 'ADMIN', 'TECHNICIAN', or 'PROFESSOR'."
            )
        user.role = role_upper

    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    if user_update.password:
        if len(user_update.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long."
            )
        user.password_hash = get_password_hash(user_update.password)

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return populate_user_lab_name(user)