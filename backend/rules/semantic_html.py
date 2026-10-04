"""
semantic_html.py — Flags non-semantic elements used where semantic ones should be.

WCAG 2.1 SC 1.3.1 / 4.1.2: Use semantic HTML for landmarks and interactive elements.
"""

from typing import List, Dict, Any
from .base import IRule


class SemanticHTMLRule(IRule):

    @property
    def rule_id(self) -> str:
        return "semantic-html"

    @property
    def description(self) -> str:
        return "Prefer semantic HTML elements over generic div/span with roles"

    @property
    def wcag_ref(self) -> str:
        return "1.3.1"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []

        role_to_element = {
            "banner": "header",
            "navigation": "nav",
            "main": "main",
            "contentinfo": "footer",
            "complementary": "aside",
            "button": "button",
        }

        for node in nodes:
            if node["tag"] in ("div", "span"):
                role = node["attrs"].get("role", "")
                if role in role_to_element:
                    better = role_to_element[role]
                    issues.append({
                        "rule_id": self.rule_id,
                        "severity": "low",
                        "line": node["line"],
                        "message": f"<{node['tag']} role=\"{role}\"> on line {node['line']} should be <{better}>",
                        "recommendation": f"Replace <{node['tag']} role=\"{role}\"> with <{better}> for native semantics",
                    })

            # Check for click handlers on non-interactive elements
            if node["tag"] in ("div", "span"):
                if "onClick" in node["attrs"] or "onclick" in node["attrs"]:
                    if not node["attrs"].get("role") and not node["attrs"].get("tabindex"):
                        issues.append({
                            "rule_id": self.rule_id,
                            "severity": "high",
                            "line": node["line"],
                            "message": f"<{node['tag']}> on line {node['line']} has a click handler but is not interactive",
                            "recommendation": "Use a <button> instead, or add role=\"button\" and tabindex=\"0\"",
                        })
        return issues
