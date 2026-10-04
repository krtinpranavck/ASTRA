"""
form_label.py — Detects form inputs without associated labels.

WCAG 2.1 SC 1.3.1 / 4.1.2: Form controls must have labels.
"""

from typing import List, Dict, Any
from .base import IRule


class FormLabelRule(IRule):

    @property
    def rule_id(self) -> str:
        return "form-label"

    @property
    def description(self) -> str:
        return "Form inputs must have an associated label"

    @property
    def wcag_ref(self) -> str:
        return "4.1.2"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []

        # Collect all label "for" targets
        label_targets = set()
        for node in nodes:
            if node["tag"] == "label":
                for_val = node["attrs"].get("htmlFor") or node["attrs"].get("htmlfor") or node["attrs"].get("for")
                if for_val:
                    label_targets.add(for_val)

        # Check inputs
        input_tags = {"input", "select", "textarea"}
        for node in nodes:
            if node["tag"] in input_tags:
                input_type = node["attrs"].get("type", "text")
                if input_type in ("hidden", "submit", "button", "reset"):
                    continue

                input_id = node["attrs"].get("id")
                has_label = input_id and input_id in label_targets
                has_aria = node["attrs"].get("aria-label") or node["attrs"].get("aria-labelledby")

                if not has_label and not has_aria:
                    issues.append({
                        "rule_id": self.rule_id,
                        "severity": "high",
                        "line": node["line"],
                        "message": f"<{node['tag']}> on line {node['line']} has no associated label",
                        "recommendation": "Add a <label for=\"id\"> element or an aria-label attribute",
                    })
        return issues
