from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import logging
from app.core.config import settings
import os

logger = logging.getLogger(__name__)

# 1. Définition de la variable db_url (manquante auparavant)
if os.environ.get("VERCEL"):
    # Sur Vercel : utilise DATABASE_URL si configurée (ex: Neon PostgreSQL), sinon SQLite éphémère dans /tmp/
    db_url = os.environ.get("DATABASE_URL", "sqlite:////tmp/sample_tracking.db")
else:
    # En local : utilise la configuration de settings (PostgreSQL local)
    db_url = settings.get_database_url()

# Adaptation pour la compatibilité SQLAlchemy avec les URLs postgresql://
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)


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
                "Falling back to SQLite database."
            )
            fallback_sqlite = "sqlite:////tmp/labtrack.db" if os.environ.get("VERCEL") else "sqlite:///./labtrack.db"
            return create_engine(
                fallback_sqlite,
                connect_args={"check_same_thread": False}
            )
    else:
        connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
        return create_engine(url, connect_args=connect_args)


# 2. Création de l'engine avec db_url enfin définie
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