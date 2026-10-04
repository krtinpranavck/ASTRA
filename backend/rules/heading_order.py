"""
heading_order.py — Detects headings that skip levels (e.g. h1 -> h3).

WCAG 2.1 SC 1.3.1: Information and relationships must be programmatically determined.
"""

from typing import List, Dict, Any
from .base import IRule


class HeadingOrderRule(IRule):

    @property
    def rule_id(self) -> str:
        return "heading-order"

    @property
    def description(self) -> str:
        return "Headings must not skip levels"

    @property
    def wcag_ref(self) -> str:
        return "1.3.1"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []
        heading_tags = {"h1", "h2", "h3", "h4", "h5", "h6"}
        prev_level = 0

        for node in nodes:
            tag = node["tag"]
            if tag in heading_tags:
                level = int(tag[1])
                if prev_level > 0 and level > prev_level + 1:
                    issues.append({
                        "rule_id": self.rule_id,
                        "severity": "medium",
                        "line": node["line"],
                        "message": f"Heading <{tag}> on line {node['line']} skips from h{prev_level} to h{level}",
                        "recommendation": f"Use <h{prev_level + 1}> instead, or add the missing intermediate heading",
                    })
                prev_level = level
        return issues
