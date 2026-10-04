"""
calculator.py — Severity classification and accessibility score calculation.

Scoring formula:
    score = max(0, 100 - sum(penalty per issue))
    high = -10 points, medium = -5 points, low = -2 points
"""

from typing import List, Dict, Any

SEVERITY_WEIGHTS = {
    "high": 10,
    "medium": 5,
    "low": 2,
}


def classify_issues(issues: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Count issues by severity level.

    Returns:
        Dict like {"high": 2, "medium": 3, "low": 1}
    """
    counts = {"high": 0, "medium": 0, "low": 0}
    for issue in issues:
        sev = issue.get("severity", "low")
        counts[sev] = counts.get(sev, 0) + 1
    return counts


def calculate_score(issues: List[Dict[str, Any]]) -> int:
    """
    Calculate a 0-100 accessibility score based on issue severities.

    Returns:
        Integer score, 100 = no issues found, 0 = many critical issues.
    """
    penalty = 0
    for issue in issues:
        sev = issue.get("severity", "low")
        penalty += SEVERITY_WEIGHTS.get(sev, 2)
    return max(0, 100 - penalty)
