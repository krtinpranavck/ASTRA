"""
table_headers.py — Checks that data tables contain header cells.

WCAG 2.1 SC 1.3.1: Data tables must use <th> elements (with scope) so that
assistive technology can associate header labels with data cells.
"""

from typing import List, Dict, Any
from .base import IRule


class TableHeadersRule(IRule):

    @property
    def rule_id(self) -> str:
        return "table-headers"

    @property
    def description(self) -> str:
        return "Data tables must have header cells (<th>)"

    @property
    def wcag_ref(self) -> str:
        return "1.3.1"

    @property
    def wcag_level(self) -> str:
        return "A"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []

        table_positions = [i for i, n in enumerate(nodes) if n["tag"] == "table"]
        th_positions = {i for i, n in enumerate(nodes) if n["tag"] == "th"}

        for order, table_pos in enumerate(table_positions):
            # Nodes belonging to this table = between this <table> and the next one
            next_table_pos = (
                table_positions[order + 1]
                if order + 1 < len(table_positions)
                else len(nodes)
            )
            has_th = any(table_pos < j < next_table_pos for j in th_positions)
            if not has_th:
                node = nodes[table_pos]
                issues.append({
                    "rule_id": self.rule_id,
                    "severity": "high",
                    "line": node["line"],
                    "message": (
                        f"<table> on line {node['line']} has no header cells (<th>)"
                    ),
                    "recommendation": (
                        "Add <th> elements for column or row headers and use scope=\"col\" "
                        "or scope=\"row\" to associate them with data cells. "
                        "Wrap headers in a <thead> element for clearer structure."
                    ),
                })

        return issues
