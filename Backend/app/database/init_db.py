from dotenv import load_dotenv
import logging
import os
from sqlalchemy import text
from app.database.database import Base, engine, SessionLocal
from app.models import User, SampleType, WorkflowStage, Location, Laboratory, Sample, UserSession

load_dotenv()
from app.core.security import get_password_hash
from app.services.laboratory_service import get_or_create_laboratory

logger = logging.getLogger(__name__)

ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD")
TECH_PASSWORD = os.getenv("SEED_TECH_PASSWORD")

if not ADMIN_PASSWORD or not TECH_PASSWORD:
    raise ValueError("ERREUR DE SÉCURITÉ : Configurez SEED_ADMIN_PASSWORD et SEED_TECH_PASSWORD dans votre environnement.")

def init_db():
    """Initialize database tables, migrate schemas safely, and populate seed data."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    # Lightweight DDL migration for existing tables created prior to multi-lab schema
    with engine.connect() as conn:
        try:
            # PostgreSQL syntax
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS laboratory_id INTEGER;"))
            conn.execute(text("ALTER TABLE samples ADD COLUMN IF NOT EXISTS laboratory_id INTEGER;"))
            conn.commit()
        except Exception as e:
            logger.info(f"Migration note (if SQLite or already migrated): {e}")

    db = SessionLocal()
    try:
        # 1. Seed Default Laboratory
        default_lab = get_or_create_laboratory(db, "Central Laboratory Agadir")

        # 2. Seed Users & Migrate existing users without laboratory_id
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@gmail.com",
                password_hash=get_password_hash(ADMIN_PASSWORD),
                role="ADMIN",
                laboratory_id=default_lab.id,
                is_active=True
            )
            db.add(admin_user)
            logger.info("Admin user created.")
        elif not admin_user.laboratory_id:
            admin_user.laboratory_id = default_lab.id

        tech_user = db.query(User).filter(User.username == "technician").first()
        if not tech_user:
            tech_user = User(
                username="technician",
                email="technician@gmail.com",
                password_hash=get_password_hash(TECH_PASSWORD),
                role="TECHNICIAN",
                laboratory_id=default_lab.id,
                is_active=True
            )
            db.add(tech_user)
            logger.info("Technician user created.")
        elif not tech_user.laboratory_id:
            tech_user.laboratory_id = default_lab.id

        # Update any orphan users
        db.query(User).filter(User.laboratory_id == None).update({"laboratory_id": default_lab.id})

        # Update any orphan samples
        db.query(Sample).filter(Sample.laboratory_id == None).update({"laboratory_id": default_lab.id})

        # 3. Seed Sample Types
        default_sample_types = [
            {"name": "Plant", "description": "Botanical and agricultural vegetation samples"},
            {"name": "Soil", "description": "Geological and soil core analytical samples"},
        ]
        for st in default_sample_types:
            existing_st = db.query(SampleType).filter(SampleType.name == st["name"]).first()
            if not existing_st:
                db.add(SampleType(name=st["name"], description=st["description"], is_active=True))
                logger.info(f"SampleType '{st['name']}' created.")

        # 4. Seed Workflow Stages
        default_stages = [
            {"name": "RECEPTION", "stage_order": 1, "description": "Sample intake and initial barcode printing"},
            {"name": "OVEN", "stage_order": 2, "description": "Thermodynamic treatment and drying process"},
            {"name": "ANALYSIS", "stage_order": 3, "description": "Chemical and physical lab testing"},
            {"name": "STORAGE", "stage_order": 4, "description": "Archived repository storage custody"},
        ]
        for stage in default_stages:
            existing_stage = db.query(WorkflowStage).filter(WorkflowStage.name == stage["name"]).first()
            if not existing_stage:
                db.add(WorkflowStage(
                    name=stage["name"],
                    stage_order=stage["stage_order"],
                    description=stage["description"],
                    is_active=True
                ))
                logger.info(f"WorkflowStage '{stage['name']}' created.")

        # 5. Seed Locations
        default_locations = [
            {"name": "Reception Area", "description": "Intake station and sample registry desk"},
            {"name": "Oven Area", "description": "Thermal drying ovens unit"},
            {"name": "Laboratory", "description": "Main analytical laboratory testing facility"},
            {"name": "Storage Area", "description": "Cold storage and archive vault"},
        ]
        for loc in default_locations:
            existing_loc = db.query(Location).filter(Location.name == loc["name"]).first()
            if not existing_loc:
                db.add(Location(name=loc["name"], description=loc["description"], is_active=True))
                logger.info(f"Location '{loc['name']}' created.")

        db.commit()
        logger.info("Database initialization and seed process completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during database initialization: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    init_db()