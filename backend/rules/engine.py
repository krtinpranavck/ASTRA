"""
engine.py — The Rule Engine: a plug-in registry that fans an AST out
to every registered IRule and collects their issues.
"""

from typing import List, Dict, Any
from .base import IRule
from .alt_text import AltTextRule
from .form_label import FormLabelRule
from .heading_order import HeadingOrderRule
from .semantic_html import SemanticHTMLRule
from .keyboard_access import KeyboardAccessRule
from .lang_attribute import LangAttributeRule
from .empty_interactive import EmptyInteractiveRule
from .table_headers import TableHeadersRule
from .color_contrast import ColorContrastRule


# Registry: add a new rule here and it's automatically included in every scan
_RULES: List[IRule] = [
    AltTextRule(),
    FormLabelRule(),
    HeadingOrderRule(),
    SemanticHTMLRule(),
    KeyboardAccessRule(),
    LangAttributeRule(),
    EmptyInteractiveRule(),
    TableHeadersRule(),
    ColorContrastRule(),
]


def get_registered_rules() -> List[IRule]:
    """Return a copy of the rule list."""
    return list(_RULES)


def run_all(nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Fan the AST nodes out to every registered rule and collect all issues.

    Args:
        nodes: Parsed AST node list from ast_parser.parse_source().

    Returns:
        Combined list of Issue dicts from all rules, sorted by line number.
    """
    all_issues = []
    for rule in _RULES:
        issues = rule.check(nodes)
        for issue in issues:
            issue["wcag_ref"] = rule.wcag_ref
            issue["wcag_level"] = rule.wcag_level
        all_issues.extend(issues)
    all_issues.sort(key=lambda i: i["line"])
    return all_issues
