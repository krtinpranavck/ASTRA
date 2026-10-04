"""
base.py — Abstract base class for all ASTRA accessibility rules.

Every concrete rule (AltTextRule, FormLabelRule, etc.) implements
the `check()` method and returns a list of Issue dicts.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class IRule(ABC):
    """Interface that every accessibility detection rule must satisfy."""

    @property
    @abstractmethod
    def rule_id(self) -> str:
        """Short identifier like 'alt-text' or 'form-label'."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of what this rule checks."""
        ...

    @property
    @abstractmethod
    def wcag_ref(self) -> str:
        """WCAG 2.1 success criterion reference (e.g. '1.1.1')."""
        ...

    @property
    @abstractmethod
    def wcag_level(self) -> str:
        """WCAG conformance level: 'A', 'AA', or 'AAA'."""
        ...

    @abstractmethod
    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run the rule against a list of parsed AST nodes.

        Each node is a dict with at least:
            - tag: str (e.g. 'img', 'input', 'h1')
            - attrs: dict of attribute name -> value
            - line: int (line number in source)
            - text: str (inner text content, may be empty)

        Returns a list of Issue dicts:
            - rule_id: str
            - severity: str ('high', 'medium', 'low')
            - line: int
            - message: str
            - recommendation: str
        """
        ...
