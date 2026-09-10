import logging
import os
from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# 1. Priorité absolue à la variable d'environnement DATABASE_URL (Vercel / Supabase)
db_url = os.environ.get("DATABASE_URL")

if not db_url:
  try:
    db_url = settings.get_database_url()
  except Exception:
    db_url = (
        "sqlite:////tmp/sample_tracking.db"
        if os.environ.get("VERCEL")
        else "sqlite:///./sample_tracking.db"
    )

# 2. Correction de compatibilité SQLAlchemy pour les URLs Supabase (postgres:// -> postgresql://)
if db_url and db_url.startswith("postgres://"):
  db_url = db_url.replace("postgres://", "postgresql://", 1)


def create_db_engine(url: str):
  """Crée le moteur de base de données adapté pour PostgreSQL Supabase ou SQLite."""
  if url.startswith("postgresql"):
    logger.info("Connexion à la base de données PostgreSQL Supabase...")
    return create_engine(
        url,
        pool_pre_ping=True,  # Teste la connexion avant chaque requête (évite les déconnexions Supabase)
        pool_recycle=300,  # Recycle les connexions toutes les 5 min
        pool_size=10,
        max_overflow=20,
    )
  else:
    logger.info("Connexion à la base de données SQLite locale...")
    return create_engine(url, connect_args={"check_same_thread": False})


# 3. Initialisation du moteur et des sessions
engine = create_db_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
  """Dépendance pour fournir des sessions de BDD aux routes FastAPI."""
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()