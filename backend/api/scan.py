"""
scan.py — /scan and /scan/url endpoints. Orchestrates the full pipeline:
    source / URL → parser → rule engine → scorer → DB → report
"""

import json
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from ..database import database, scans_table
from ..models.schemas import (
    Issue,
    ScanHistoryEntry,
    ScanRequest,
    SeveritySummary,
    UrlScanRequest,
)
from ..parser.ast_parser import parse_source
from ..rules.engine import run_all
from ..scoring.calculator import calculate_score, classify_issues

router = APIRouter()

# Full Chrome-like request headers. Many sites (Wikipedia, news, blogs) reject
# requests that look like bots. These headers match what Chrome 124 sends for
# a top-level navigation so the vast majority of public pages respond normally.
_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,image/apng,*/*;q=0.8,"
        "application/signed-exchange;v=b3;q=0.7"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    # Accept-Encoding is intentionally omitted — httpx manages decompression
    # automatically. Explicitly setting it can prevent auto-decompression when
    # the server returns brotli-encoded content.
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
}


async def _save_to_db(entry: ScanHistoryEntry) -> None:
    """Persist a completed scan. Best-effort — never fails the HTTP response."""
    try:
        await database.execute(
            scans_table.insert(),
            {
                "id": entry.id,
                "project_name": entry.project_name,
                "score": entry.score,
                "total_issues": entry.total_issues,
                "severity_high": entry.severity_summary.high,
                "severity_medium": entry.severity_summary.medium,
                "severity_low": entry.severity_summary.low,
                "issues_json": json.dumps([i.model_dump() for i in entry.issues]),
                "scanned_at": entry.date,
            },
        )
    except Exception:
        pass


def _build_entry(nodes: list, project_name: str) -> ScanHistoryEntry:
    raw_issues = run_all(nodes)
    severity_counts = classify_issues(raw_issues)
    score = calculate_score(raw_issues)
    issues = [Issue(**i) for i in raw_issues]
    summary = SeveritySummary(**severity_counts)
    return ScanHistoryEntry(
        id=str(uuid.uuid4()),
        date=datetime.now(timezone.utc).isoformat(),
        project_name=project_name,
        score=score,
        total_issues=len(issues),
        severity_summary=summary,
        issues=issues,
    )


@router.post("/scan", response_model=ScanHistoryEntry)
async def scan(request: ScanRequest) -> ScanHistoryEntry:
    """Scan pasted / uploaded source code (HTML or JSX)."""
    nodes = parse_source(request.source_code)
    entry = _build_entry(nodes, request.project_name or "Untitled")
    await _save_to_db(entry)
    return entry


@router.post("/scan/url", response_model=ScanHistoryEntry)
async def scan_url(request: UrlScanRequest) -> ScanHistoryEntry:
    """Fetch a live URL and scan its rendered HTML for accessibility issues."""
    try:
        async with httpx.AsyncClient(
            follow_redirects=True, timeout=20.0
        ) as client:
            response = await client.get(request.url, headers=_BROWSER_HEADERS)
            response.raise_for_status()
            html = response.text
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=422,
            detail=(
                f"HTTP {exc.response.status_code} from {request.url}. "
                "The page may require a login or block all automated access "
                "(e.g. Cloudflare-protected sites). Try the source code scan instead."
            ),
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not reach {request.url}: {exc}",
        )

    nodes = parse_source(html)

    # Tags that carry actual content — script/meta/link/style don't count.
    _CONTENT_TAGS = {
        "img", "input", "button", "a", "form", "select", "textarea",
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "td", "th",
        "nav", "main", "header", "footer", "section", "article", "aside",
        "label", "table", "figure", "video", "audio", "iframe",
    }
    content_nodes = [n for n in nodes if n["tag"] in _CONTENT_TAGS]

    if len(content_nodes) < 2:
        raise HTTPException(
            status_code=422,
            detail=(
                "This page returned no meaningful HTML content. It is likely a "
                "client-rendered SPA (React/Vue/Angular) that requires JavaScript to render, "
                "or it blocks automated access. "
                "Paste the component source code instead for an accurate scan."
            ),
        )

    project_name = request.project_name or request.url
    entry = _build_entry(nodes, project_name)
    await _save_to_db(entry)
    return entry
