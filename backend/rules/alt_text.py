"""
alt_text.py — Detects images missing alt attributes.

WCAG 2.1 SC 1.1.1: All non-text content must have a text alternative.
"""

from typing import List, Dict, Any
from .base import IRule


class AltTextRule(IRule):

    @property
    def rule_id(self) -> str:
        return "alt-text"

    @property
    def description(self) -> str:
        return "Images must have an alt attribute"

    @property
    def wcag_ref(self) -> str:
        return "1.1.1"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []
        for node in nodes:
            if node["tag"] == "img":
                alt = node["attrs"].get("alt")
                if alt is None:
                    issues.append({
                        "rule_id": self.rule_id,
                        "severity": "high",
                        "line": node["line"],
                        "message": f"<img> on line {node['line']} is missing the alt attribute",
                        "recommendation": "Add alt=\"descriptive text\" to every <img> element",
                    })
                elif alt.strip() == "":
                    issues.append({
                        "rule_id": self.rule_id,
                        "severity": "medium",
                        "line": node["line"],
                        "message": f"<img> on line {node['line']} has an empty alt attribute",
                        "recommendation": "Provide meaningful alt text, or use alt=\"\" only for decorative images and add role=\"presentation\"",
                    })
        return issues
