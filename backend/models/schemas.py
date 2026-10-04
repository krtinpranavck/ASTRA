"""
schemas.py — Pydantic models for API request/response validation.
"""

from pydantic import BaseModel
from typing import List, Optional


class ScanRequest(BaseModel):
    source_code: str
    project_name: Optional[str] = "Untitled"


class UrlScanRequest(BaseModel):
    url: str
    project_name: Optional[str] = None


class Issue(BaseModel):
    rule_id: str
    severity: str
    wcag_ref: str
    wcag_level: str
    line: int
    message: str
    recommendation: str


class SeveritySummary(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0


class ScanReport(BaseModel):
    project_name: str
    score: int
    total_issues: int
    severity_summary: SeveritySummary
    issues: List[Issue]


class ScanHistoryEntry(ScanReport):
    """A ScanReport enriched with the database id and timestamp."""
    id: str
    date: str
