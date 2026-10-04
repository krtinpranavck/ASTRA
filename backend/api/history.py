"""
history.py — Scan history endpoints backed by the database.
"""

import json
from typing import List
from fastapi import APIRouter
from ..database import database, scans_table
from ..models.schemas import ScanHistoryEntry, Issue, SeveritySummary

router = APIRouter()


@router.get("/history", response_model=List[ScanHistoryEntry])
async def get_history() -> List[ScanHistoryEntry]:
    rows = await database.fetch_all(
        scans_table.select()
        .order_by(scans_table.c.scanned_at.desc())
        .limit(100)
    )
    result = []
    for row in rows:
        issues = [Issue(**i) for i in json.loads(row["issues_json"])]
        result.append(
            ScanHistoryEntry(
                id=row["id"],
                date=row["scanned_at"],
                project_name=row["project_name"],
                score=row["score"],
                total_issues=row["total_issues"],
                severity_summary=SeveritySummary(
                    high=row["severity_high"],
                    medium=row["severity_medium"],
                    low=row["severity_low"],
                ),
                issues=issues,
            )
        )
    return result


@router.delete("/history")
async def clear_history() -> dict:
    await database.execute(scans_table.delete())
    return {"deleted": True}


@router.delete("/history/{scan_id}")
async def delete_scan(scan_id: str) -> dict:
    await database.execute(
        scans_table.delete().where(scans_table.c.id == scan_id)
    )
    return {"deleted": True}
