from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_user_session,
    verify_and_refresh_session,
    revoke_user_session
)
from app.core.dependencies import get_current_user, require_authenticated_user
from app.services.laboratory_service import get_or_create_laboratory

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def populate_user_lab_name(user: User) -> User:
    """Helper to attach laboratory_name to user ORM object for Pydantic serialization."""
    if user and user.laboratory:
        user.laboratory_name = user.laboratory.name
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with email (or username) and password.
    Creates an access token and a persistent or non-persistent refresh session.
    """
    identifier = (login_data.email or login_data.username or "").strip()
    password = login_data.password

    if not identifier or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/Username and password are required."
        )

    # Search user by email (case-insensitive) or username
    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.username == identifier)
    ).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive."
        )

    # Create persistent or non-persistent refresh session
    session = create_user_session(
        db,
        user.id,
        remember_me=login_data.remember_me
    )

    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "role": user.role,
            "laboratory_id": user.laboratory_id
        }
    )

    user = populate_user_lab_name(user)

    return {
        "access_token": access_token,
        "refresh_token": session.refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new laboratory staff user.

    Each laboratory can contain:
    - Maximum 1 TECHNICIAN
    - Maximum 1 PROFESSOR

    Administrative accounts cannot be created through public registration.
    """

    email_clean = user_in.email.strip().lower()

    # ============================================================
    # CHECK EXISTING EMAIL
    # ============================================================

    existing_email = db.query(User).filter(
        User.email.ilike(email_clean)
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    # ============================================================
    # DERIVE USERNAME
    # ============================================================

    username_clean = (
        user_in.username.strip()
        if user_in.username
        else email_clean.split("@")[0]
    )

    existing_username = db.query(User).filter(
        User.username == username_clean
    ).first()

    if existing_username:
        # Append identifier if duplicate username
        username_clean = (
            f"{username_clean}_{db.query(User).count() + 1}"
        )

    # ============================================================
    # VALIDATE ROLE
    # ============================================================

    role_upper = user_in.role.upper()

    if role_upper == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Administrative accounts cannot be created "
                "via public registration."
            )
        )

    if role_upper not in ["TECHNICIAN", "PROFESSOR"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid role specified. Allowed public registration "
                "roles are 'TECHNICIAN' or 'PROFESSOR'."
            )
        )

    # ============================================================
    # VALIDATE LABORATORY NAME
    # ============================================================

    if (
        not user_in.laboratory_name
        or not user_in.laboratory_name.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Laboratory name is required."
        )

    laboratory_name_clean = user_in.laboratory_name.strip()

    # ============================================================
    # GET OR CREATE LABORATORY
    # ============================================================

    lab = get_or_create_laboratory(
        db,
        laboratory_name_clean
    )

    # ============================================================
    # LABORATORY ACCOUNT LIMIT
    #
    # Each laboratory can have:
    #   1 TECHNICIAN maximum
    #   1 PROFESSOR maximum
    # ============================================================

    existing_role_user = db.query(User).filter(
        User.laboratory_id == lab.id,
        User.role == role_upper
    ).first()

    if existing_role_user:
        if role_upper == "TECHNICIAN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"The laboratory '{lab.name}' already has "
                    f"a Technician account. Only one Technician "
                    f"is allowed per laboratory."
                )
            )

        if role_upper == "PROFESSOR":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"The laboratory '{lab.name}' already has "
                    f"a Professor account. Only one Professor "
                    f"is allowed per laboratory."
                )
            )

    # ============================================================
    # CREATE USER
    # ============================================================

    hashed_password = get_password_hash(user_in.password)

    new_user = User(
        username=username_clean,
        email=email_clean,
        password_hash=hashed_password,
        role=role_upper,
        laboratory_id=lab.id,
        is_active=user_in.is_active
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_user = populate_user_lab_name(new_user)

    return new_user


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(
    refresh_in: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Exchanges a valid refresh token session for a new access token
    without requiring password re-entry.
    """
    try:
        user, session = verify_and_refresh_session(
            db,
            refresh_in.refresh_token
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(ve)
        )

    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "role": user.role,
            "laboratory_id": user.laboratory_id
        }
    )

    user = populate_user_lab_name(user)

    return {
        "access_token": access_token,
        "refresh_token": session.refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    refresh_in: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db)
):
    """Revokes the active user refresh session upon explicit logout."""
    if refresh_in and refresh_in.refresh_token:
        revoke_user_session(
            db,
            refresh_in.refresh_token
        )

    return {
        "status": "success",
        "message": "Session revoked successfully."
    }


@router.get(
    "/me",
    response_model=UserResponse
)
def get_current_user_profile(
    current_user: User = Depends(require_authenticated_user)
):
    """Retrieve the current authenticated user's profile and laboratory details."""
    current_user = populate_user_lab_name(current_user)
    return current_user