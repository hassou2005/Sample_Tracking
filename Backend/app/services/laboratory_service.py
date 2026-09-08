import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.laboratory import Laboratory


def normalize_laboratory_name(raw_name: str) -> str:
    """
    Normalizes laboratory names to prevent duplicates caused by extra spaces or mixed casing:
    - Trims leading and trailing spaces
    - Collapses multiple internal spaces into a single space
    - Preserves clean title-cased or user-entered structure
    """
    if not raw_name:
        return ""
    cleaned = raw_name.strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.title()


def generate_laboratory_code(name: str) -> str:
    """Generates a standardized unique laboratory code string based on name."""
    clean_code = re.sub(r'[^A-Za-z0-9]', '', name).upper()
    if not clean_code:
        clean_code = "LAB"
    return f"LAB-{clean_code[:12]}"


def get_or_create_laboratory(db: Session, raw_name: str) -> Laboratory:
    """
    Case-insensitively searches for an existing laboratory or creates a new one automatically.
    Prevents duplicate laboratories caused by formatting or capitalization differences.
    """
    clean_name = normalize_laboratory_name(raw_name)
    if not clean_name:
        clean_name = "Central Laboratory"

    existing_lab = db.query(Laboratory).filter(
        func.lower(Laboratory.name) == clean_name.lower()
    ).first()

    if existing_lab:
        return existing_lab

    # Create new laboratory automatically
    base_code = generate_laboratory_code(clean_name)
    code = base_code

    # Ensure code uniqueness
    counter = 1
    while db.query(Laboratory).filter(Laboratory.code == code).first():
        code = f"{base_code}-{counter}"
        counter += 1

    new_lab = Laboratory(
        name=clean_name,
        code=code,
        is_active=True
    )
    db.add(new_lab)
    db.commit()
    db.refresh(new_lab)
    return new_lab

