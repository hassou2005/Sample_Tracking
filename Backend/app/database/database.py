from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import logging
from app.core.config import settings
import os
logger = logging.getLogger(__name__)

db_url = settings.get_database_url()

# Si nous sommes sur Vercel, écrire la base dans /tmp/
if os.environ.get("VERCEL"):
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/sample_tracking.db"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sample_tracking.db"
    
def create_db_engine(url: str):
    """Create database engine with fallback for local developer environments."""
    if url.startswith("postgresql"):
        try:
            eng = create_engine(
                url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            # Test connection
            with eng.connect():
                pass
            logger.info("Successfully connected to PostgreSQL database.")
            return eng
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection to {url} failed: {e}. "
                "Falling back to SQLite database (sqlite:///./labtrack.db)."
            )
            return create_engine(
                "sqlite:///./labtrack.db",
                connect_args={"check_same_thread": False}
            )
    else:
        return create_engine(url)


engine = create_db_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for providing database sessions to FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

