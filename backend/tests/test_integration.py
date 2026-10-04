"""
test_integration.py — End-to-end integration tests.

These test the full pipeline: source code string -> parser -> rules -> score -> report.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app


client = TestClient(app)


class TestFullPipeline:
    """Integration tests hitting the /scan endpoint with real HTML/JSX."""

    def test_clean_html_scores_100(self):
        """HTML with no accessibility issues should score 100."""
        html = """
        <html>
        <body>
            <h1>Welcome</h1>
            <h2>About</h2>
            <img src="logo.png" alt="Company logo">
            <label for="email">Email</label>
            <input type="text" id="email">
            <nav>Navigation here</nav>
            <button onClick="submit()">Submit</button>
        </body>
        </html>
        """
        resp = client.post("/scan", json={"source_code": html, "project_name": "CleanSite"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["score"] == 100
        assert data["total_issues"] == 0
        assert data["project_name"] == "CleanSite"

    def test_broken_html_finds_issues(self):
        """HTML with multiple problems should detect them all."""
        html = """
        <html>
        <body>
            <h1>Title</h1>
            <h3>Skipped h2</h3>
            <img src="photo.jpg">
            <input type="text">
            <div onClick="doSomething()">Click me</div>
        </body>
        </html>
        """
        resp = client.post("/scan", json={"source_code": html})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_issues"] >= 3
        assert data["score"] < 100

        rule_ids = [i["rule_id"] for i in data["issues"]]
        assert "alt-text" in rule_ids
        assert "heading-order" in rule_ids

    def test_jsx_component_scan(self):
        """A React JSX component with issues should be caught."""
        jsx = """
        <div>
            <h1>Dashboard</h1>
            <img src="avatar.png" />
            <div role="navigation">
                <a href="/home">Home</a>
            </div>
            <input type="text" placeholder="Search" />
            <span onClick="toggle()">Menu</span>
        </div>
        """
        resp = client.post("/scan", json={"source_code": jsx, "project_name": "ReactApp"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_issues"] >= 2
        assert data["score"] < 100

    def test_health_endpoint(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_empty_source(self):
        """Empty source should return score 100 and no issues."""
        resp = client.post("/scan", json={"source_code": ""})
        assert resp.status_code == 200
        data = resp.json()
        assert data["score"] == 100
        assert data["total_issues"] == 0


class TestRegressionSuite:
    """Regression tests for previously-fixed edge cases."""

    def test_img_with_alt_empty_string_is_medium_not_high(self):
        """Regression: empty alt should be medium severity, not high."""
        html = '<img src="decorative.png" alt="">'
        resp = client.post("/scan", json={"source_code": html})
        data = resp.json()
        if data["total_issues"] > 0:
            for issue in data["issues"]:
                if issue["rule_id"] == "alt-text":
                    assert issue["severity"] == "medium"

    def test_submit_button_not_flagged(self):
        """Regression: submit buttons should not be flagged as missing labels."""
        html = '<input type="submit" value="Go">'
        resp = client.post("/scan", json={"source_code": html})
        data = resp.json()
        label_issues = [i for i in data["issues"] if i["rule_id"] == "form-label"]
        assert len(label_issues) == 0

    def test_label_with_htmlfor(self):
        """Regression: JSX uses htmlFor instead of for."""
        html = """
        <label htmlFor="user">Username</label>
        <input type="text" id="user">
        """
        resp = client.post("/scan", json={"source_code": html})
        data = resp.json()
        label_issues = [i for i in data["issues"] if i["rule_id"] == "form-label"]
        assert len(label_issues) == 0

    def test_multiple_issues_sorted_by_line(self):
        """Issues should come back sorted by line number."""
        html = """
        <img src="a.png">
        <h1>Title</h1>
        <h4>Deep</h4>
        <div onClick="x()">click</div>
        """
        resp = client.post("/scan", json={"source_code": html})
        data = resp.json()
        lines = [i["line"] for i in data["issues"]]
        assert lines == sorted(lines)

    def test_line_numbers_survive_multiline_jsx_expression(self):
        """Regression: a multi-line {...} expression must not shift later line numbers."""
        jsx = "<div>\n  <p>{\n    a\n  }</p>\n  <img src=\"x.png\">\n</div>"
        resp = client.post("/scan", json={"source_code": jsx})
        alt = [i for i in resp.json()["issues"] if i["rule_id"] == "alt-text"]
        assert len(alt) == 1
        assert alt[0]["line"] == 5
