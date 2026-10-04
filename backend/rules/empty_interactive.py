"""
empty_interactive.py — Detects buttons and links with no accessible name.

WCAG 2.1 SC 4.1.2: All interactive elements must have a name that screen
readers can announce.
"""

from typing import List, Dict, Any
from .base import IRule


class EmptyInteractiveRule(IRule):

    @property
    def rule_id(self) -> str:
        return "empty-interactive"

    @property
    def description(self) -> str:
        return "Buttons and links must have an accessible name"

    @property
    def wcag_ref(self) -> str:
        return "4.1.2"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []
        for idx, node in enumerate(nodes):
            if node["tag"] not in ("button", "a"):
                continue

            has_text = bool(node["text"].strip())
            has_aria = (
                node["attrs"].get("aria-label")
                or node["attrs"].get("aria-labelledby")
            )
            has_title = node["attrs"].get("title")

            if has_text or has_aria or has_title:
                continue

            # For <a> tags: if the immediately following node is an <img>
            # with a non-empty alt attribute, the image provides the name.
            if node["tag"] == "a" and idx + 1 < len(nodes):
                next_node = nodes[idx + 1]
                if next_node["tag"] == "img" and next_node["attrs"].get("alt", "").strip():
                    continue

            tag = node["tag"]
            issues.append({
                "rule_id": self.rule_id,
                "severity": "high",
                "line": node["line"],
                "message": (
                    f"<{tag}> on line {node['line']} has no accessible name "
                    f"(no text content, aria-label, or title)"
                ),
                "recommendation": (
                    f'Add visible text, an aria-label, or a title to the <{tag}>. '
                    f"Example: <{tag} aria-label=\"Close dialog\">. "
                    f"Without a name, screen readers can only announce it as \"{tag}\" with no context."
                ),
            })
        return issues
