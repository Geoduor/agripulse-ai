"""SQLAlchemy models and helpers for Supabase PostgreSQL persistence.

Activation is entirely driven by the DATABASE_URL environment variable:

- When DATABASE_URL is set, tables are created automatically at startup,
  new analyses are saved to Supabase, and /history reads from it.
- When it is not set, the app keeps using the local JSON audit log.

A Supabase connection string looks like (Session pooler, port 5432):

    postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

SSL is required by Supabase and is forced automatically here.
"""
import os
from datetime import datetime
from functools import lru_cache

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import load_env

load_env()

Base = declarative_base()


class DiagnosisLog(Base):
    """One row per farmer analysis, mirroring the JSON audit log."""

    __tablename__ = "diagnosis_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False)
    phone = Column(String(32), default="")
    crop = Column(String(64), default="")
    location = Column(String(64), default="")
    problem = Column(Text, default="")
    language_detected = Column(String(16), default="")
    urgency = Column(String(16), default="")
    diagnosis = Column(Text, default="")
    top_action = Column(Text, default="")
    emergency = Column(Boolean, default=False)
    follow_up_date = Column(String(64), default="")
    sms_sent = Column(Text, default="")


def database_enabled() -> bool:
    """True when a DATABASE_URL is configured."""
    return bool(os.getenv("DATABASE_URL", "").strip())


@lru_cache(maxsize=1)
def get_engine():
    """Create a SQLAlchemy engine for Supabase (psycopg v3 driver).

    Returns None when DATABASE_URL is not configured.
    """
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        return None

    # Make the driver explicit (psycopg v3) and support legacy postgres:// URIs
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)

    return create_engine(
        url,
        pool_pre_ping=True,
        connect_args={"sslmode": "require"},  # Supabase requires SSL
    )


@lru_cache(maxsize=1)
def _session_factory():
    engine = get_engine()
    if engine is None:
        return None
    return sessionmaker(bind=engine, expire_on_commit=False)


def get_session():
    factory = _session_factory()
    if factory is None:
        return None
    return factory()


def init_db() -> bool:
    """Create missing tables. Returns True on success, False when disabled/failed."""
    engine = get_engine()
    if engine is None:
        return False
    try:
        Base.metadata.create_all(engine)
        return True
    except Exception as e:
        print(f"[db] Could not initialize Supabase tables: {e}")
        return False


def _entry_to_row(entry: dict) -> DiagnosisLog:
    """Map a JSON-log-shaped dict to a DiagnosisLog row (not yet added)."""
    farmer = entry.get("farmer") or {}
    return DiagnosisLog(
        timestamp=datetime.strptime(entry["timestamp"], "%Y-%m-%d %H:%M:%S"),
        phone=farmer.get("phone", ""),
        crop=farmer.get("crop", ""),
        location=farmer.get("location", ""),
        problem=farmer.get("problem", ""),
        language_detected=farmer.get("language_detected", ""),
        urgency=farmer.get("urgency", ""),
        diagnosis=entry.get("diagnosis") or "",
        top_action=entry.get("top_action") or "",
        emergency=bool(entry.get("emergency")),
        follow_up_date=entry.get("follow_up_date") or "",
        sms_sent=entry.get("sms_sent") or "",
    )


def save_diagnosis(entry: dict) -> bool:
    """Persist a log entry (as built by action_executor) to Supabase.

    Best-effort: returns False (never raises) when the database is
    unconfigured or the write fails.
    """
    if not database_enabled():
        return False
    session = get_session()
    if session is None:
        return False
    try:
        session.add(_entry_to_row(entry))
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"[db] Supabase save failed (JSON log remains the fallback): {e}")
        return False
    finally:
        session.close()


def backfill_from_json(entries: list) -> int:
    """Insert existing JSON log entries into Supabase.

    Only runs when the table is empty, so restarts never duplicate data.
    Returns the number of rows inserted (0 when disabled or already
    populated).
    """
    if not database_enabled():
        return 0
    session = get_session()
    if session is None:
        return 0
    try:
        if session.query(DiagnosisLog.id).first() is not None:
            return 0  # already populated — never duplicate
        inserted = 0
        for entry in entries:
            session.add(_entry_to_row(entry))
            inserted += 1
        session.commit()
        return inserted
    except Exception as e:
        session.rollback()
        print(f"[db] Backfill from JSON log failed: {e}")
        return 0
    finally:
        session.close()


def list_diagnoses(limit: int = 100):
    """Return recent rows as JSON-log-shaped dicts, newest first.

    Returns an empty list when the database is unconfigured or unreadable.
    """
    if not database_enabled():
        return []
    session = get_session()
    if session is None:
        return []
    try:
        rows = (
            session.query(DiagnosisLog)
            .order_by(DiagnosisLog.id.desc())
            .limit(limit)
            .all()
        )
        return [{
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "farmer": {
                "phone": r.phone,
                "crop": r.crop,
                "location": r.location,
                "problem": r.problem,
                "language_detected": r.language_detected,
                "urgency": r.urgency,
            },
            "diagnosis": r.diagnosis,
            "top_action": r.top_action,
            "emergency": r.emergency,
            "follow_up_date": r.follow_up_date,
            "sms_sent": r.sms_sent,
        } for r in rows]
    except Exception as e:
        print(f"[db] Supabase read failed: {e}")
        return []
    finally:
        session.close()
