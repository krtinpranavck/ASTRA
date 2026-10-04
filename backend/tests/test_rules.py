"""
test_rules.py — Unit tests for individual accessibility rules.
"""

import pytest
from backend.rules.alt_text import AltTextRule
from backend.rules.form_label import FormLabelRule
from backend.rules.heading_order import HeadingOrderRule
from backend.rules.semantic_html import SemanticHTMLRule
from backend.rules.keyboard_access import KeyboardAccessRule


class TestAltTextRule:
    def setup_method(self):
        self.rule = AltTextRule()

    def test_missing_alt(self):
        nodes = [{"tag": "img", "attrs": {"src": "photo.jpg"}, "line": 5, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 1
        assert issues[0]["severity"] == "high"
        assert issues[0]["line"] == 5

    def test_empty_alt(self):
        nodes = [{"tag": "img", "attrs": {"src": "photo.jpg", "alt": ""}, "line": 3, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 1
        assert issues[0]["severity"] == "medium"

    def test_valid_alt(self):
        nodes = [{"tag": "img", "attrs": {"src": "photo.jpg", "alt": "A sunset"}, "line": 1, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 0

    def test_non_img_ignored(self):
        nodes = [{"tag": "div", "attrs": {}, "line": 1, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 0


class TestFormLabelRule:
    def setup_method(self):
        self.rule = FormLabelRule()

    def test_input_without_label(self):
        nodes = [
            {"tag": "input", "attrs": {"type": "text", "id": "name"}, "line": 10, "text": ""},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 1
        assert issues[0]["severity"] == "high"

    def test_input_with_label(self):
        nodes = [
            {"tag": "label", "attrs": {"for": "name"}, "line": 9, "text": "Name"},
            {"tag": "input", "attrs": {"type": "text", "id": "name"}, "line": 10, "text": ""},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 0

    def test_input_with_aria_label(self):
        nodes = [
            {"tag": "input", "attrs": {"type": "text", "aria-label": "Search"}, "line": 5, "text": ""},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 0

    def test_hidden_input_ignored(self):
        nodes = [
            {"tag": "input", "attrs": {"type": "hidden"}, "line": 1, "text": ""},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 0


class TestHeadingOrderRule:
    def setup_method(self):
        self.rule = HeadingOrderRule()

    def test_correct_order(self):
        nodes = [
            {"tag": "h1", "attrs": {}, "line": 1, "text": "Title"},
            {"tag": "h2", "attrs": {}, "line": 5, "text": "Section"},
            {"tag": "h3", "attrs": {}, "line": 10, "text": "Subsection"},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 0

    def test_skipped_level(self):
        nodes = [
            {"tag": "h1", "attrs": {}, "line": 1, "text": "Title"},
            {"tag": "h3", "attrs": {}, "line": 5, "text": "Subsection"},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 1
        assert issues[0]["severity"] == "medium"

    def test_h1_to_h4(self):
        nodes = [
            {"tag": "h1", "attrs": {}, "line": 1, "text": "Title"},
            {"tag": "h4", "attrs": {}, "line": 5, "text": "Deep"},
        ]
        issues = self.rule.check(nodes)
        assert len(issues) == 1


class TestSemanticHTMLRule:
    def setup_method(self):
        self.rule = SemanticHTMLRule()

    def test_div_with_role_nav(self):
        nodes = [{"tag": "div", "attrs": {"role": "navigation"}, "line": 3, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 1
        assert "nav" in issues[0]["recommendation"]

    def test_div_with_onclick_no_role(self):
        nodes = [{"tag": "div", "attrs": {"onClick": "handleClick"}, "line": 7, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) >= 1
        assert any(i["severity"] == "high" for i in issues)

    def test_proper_button(self):
        nodes = [{"tag": "button", "attrs": {"onClick": "handleClick"}, "line": 2, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 0


class TestKeyboardAccessRule:
    def setup_method(self):
        self.rule = KeyboardAccessRule()

    def test_div_with_click_no_tabindex(self):
        nodes = [{"tag": "div", "attrs": {"onClick": "fn"}, "line": 4, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 1
        assert issues[0]["severity"] == "high"

    def test_div_with_click_and_tabindex(self):
        nodes = [{"tag": "div", "attrs": {"onClick": "fn", "tabindex": "0"}, "line": 4, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 0

    def test_button_with_click_is_fine(self):
        nodes = [{"tag": "button", "attrs": {"onClick": "fn"}, "line": 4, "text": ""}]
        issues = self.rule.check(nodes)
        assert len(issues) == 0
