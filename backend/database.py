"""
database.py — Async database layer for scan history persistence.

Defaults to SQLite (no setup required). Switch to PostgreSQL by setting:
    DATABASE_URL=postgresql+asyncpg://user:password@host/dbname

Requires: databases[sqlite], aiosqlite, sqlalchemy
For PostgreSQL: add asyncpg to requirements and update DATABASE_URL.
"""

import os
import sqlalchemy
import databases

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./astra.db",
)

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

scans_table = sqlalchemy.Table(
    "scans",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("project_name", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("score", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("total_issues", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("severity_high", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("severity_medium", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("severity_low", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("issues_json", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("scanned_at", sqlalchemy.String, nullable=False),
)


def create_tables() -> None:
    """Create database tables synchronously at application startup."""
    sync_url = (
        DATABASE_URL
        .replace("+aiosqlite", "")
        .replace("+asyncpg", "")
    )
    connect_args = {"check_same_thread": False} if "sqlite" in sync_url else {}
    engine = sqlalchemy.create_engine(sync_url, connect_args=connect_args)
    metadata.create_all(engine)
    engine.dispose()
