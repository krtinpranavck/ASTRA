"""
lang_attribute.py — Checks that <html> declares a language attribute.

WCAG 2.1 SC 3.1.1: The default human language of each web page can be
programmatically determined.
"""

from typing import List, Dict, Any
from .base import IRule


class LangAttributeRule(IRule):

    @property
    def rule_id(self) -> str:
        return "lang-attribute"

    @property
    def description(self) -> str:
        return "The <html> element must have a lang attribute"

    @property
    def wcag_ref(self) -> str:
        return "3.1.1"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []
        for node in nodes:
            if node["tag"] == "html":
                lang = node["attrs"].get("lang", "").strip()
                if not lang:
                    issues.append({
                        "rule_id": self.rule_id,
                        "severity": "high",
                        "line": node["line"],
                        "message": (
                            f"<html> on line {node['line']} is missing the lang attribute"
                        ),
                        "recommendation": (
                            'Add a lang attribute to the <html> element, e.g. lang="en" for English. '
                            "Screen readers use this to select the correct pronunciation and voice engine."
                        ),
                    })
        return issues
