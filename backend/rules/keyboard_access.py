"""
keyboard_access.py — Checks that interactive elements are keyboard-accessible.

WCAG 2.1 SC 2.1.1: All functionality must be operable via keyboard.
"""

from typing import List, Dict, Any
from .base import IRule


class KeyboardAccessRule(IRule):

    @property
    def rule_id(self) -> str:
        return "keyboard-access"

    @property
    def description(self) -> str:
        return "Interactive elements must be keyboard accessible"

    @property
    def wcag_ref(self) -> str:
        return "2.1.1"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []
        for node in nodes:
            has_click = "onClick" in node["attrs"] or "onclick" in node["attrs"]
            if not has_click:
                continue

            # Native interactive elements are already keyboard accessible
            if node["tag"] in ("a", "button", "input", "select", "textarea"):
                continue

            tabindex = node["attrs"].get("tabindex")
            if tabindex is None:
                issues.append({
                    "rule_id": self.rule_id,
                    "severity": "high",
                    "line": node["line"],
                    "message": f"<{node['tag']}> on line {node['line']} has onClick but no tabindex",
                    "recommendation": "Add tabindex=\"0\" so keyboard users can reach this element",
                })
        return issues
