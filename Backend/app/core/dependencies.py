from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# OAuth2 Scheme to retrieve bearer token from Request Header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """Retrieve and validate the current user identity from the JWT access token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user


def require_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure that the logged-in user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return current_user


def require_admin(current_user: User = Depends(require_authenticated_user)) -> User:
    """Allow ADMIN, TECHNICIAN, and PROFESSOR users."""
    if current_user.role not in ["ADMIN", "TECHNICIAN", "PROFESSOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator, Technician, or Professor privilege required."
        )
    return current_user


def require_technician(current_user: User = Depends(require_authenticated_user)) -> User:
    """Access allowed for TECHNICIAN, PROFESSOR, and ADMIN roles."""
    if current_user.role not in ["ADMIN", "TECHNICIAN", "PROFESSOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Technician or Professor privilege required."
        )
    return current_user
