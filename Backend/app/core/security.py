import bcrypt
import uuid
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user_session import UserSession
from app.models.user import User


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    if isinstance(plain_password, str):
        plain_bytes = plain_password.encode("utf-8")
    else:
        plain_bytes = plain_password

    if isinstance(hashed_password, str):
        hashed_bytes = hashed_password.encode("utf-8")
    else:
        hashed_bytes = hashed_password

    try:
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash plaintext password with bcrypt."""
    if isinstance(password, str):
        password_bytes = password.encode("utf-8")
    else:
        password_bytes = password

    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a short-lived JWT access token containing identity, role, and laboratory context."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_refresh_token() -> str:
    """Generate a cryptographically secure UUID4 refresh token string."""
    return f"rt_{uuid.uuid4().hex}{uuid.uuid4().hex}"


def create_user_session(db: Session, user_id: int, remember_me: bool = False) -> UserSession:
    """
    Creates a new persistent or non-persistent refresh session in database:
    - If remember_me = True: 30-day persistent session.
    - If remember_me = False: 24-hour session.
    """
    token_str = generate_refresh_token()
    if remember_me:
        expires_at = datetime.utcnow() + timedelta(days=30)
    else:
        expires_at = datetime.utcnow() + timedelta(hours=24)

    session = UserSession(
        user_id=user_id,
        refresh_token=token_str,
        remember_me=remember_me,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def verify_and_refresh_session(db: Session, refresh_token_str: str) -> Tuple[User, UserSession]:
    """
    Verifies a refresh token session, ensures it is active and not expired.
    """
    session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token_str,
        UserSession.is_revoked == False
    ).first()

    if not session:
        raise ValueError("Invalid or revoked refresh session.")

    if session.expires_at < datetime.utcnow():
        session.is_revoked = True
        db.commit()
        raise ValueError("Refresh session has expired.")

    user = db.query(User).filter(User.id == session.user_id, User.is_active == True).first()
    if not user:
        session.is_revoked = True
        db.commit()
        raise ValueError("User account associated with session is inactive or deleted.")

    return user, session


def revoke_user_session(db: Session, refresh_token_str: str) -> bool:
    """Revokes a refresh session upon explicit user logout."""
    if not refresh_token_str:
        return False
    session = db.query(UserSession).filter(UserSession.refresh_token == refresh_token_str).first()
    if session:
        session.is_revoked = True
        db.commit()
        return True
    return False
