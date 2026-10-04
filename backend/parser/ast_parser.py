"""
ast_parser.py — Parses JSX/HTML source code into a flat list of element nodes.

Uses the html.parser stdlib module to tokenize tags and attributes.
This handles standard HTML and the HTML-like subset of JSX that matters
for accessibility checks (img, input, label, headings, div, span, a, button).
"""

from html.parser import HTMLParser
from typing import List, Dict, Any


class ASTNodeExtractor(HTMLParser):
    """Walks HTML/JSX and collects every opening tag as a node dict."""

    def __init__(self):
        super().__init__()
        self.nodes: List[Dict[str, Any]] = []
        self._current_line = 1

    def handle_starttag(self, tag: str, attrs: list):
        line = self.getpos()[0]
        attr_dict = {}
        for name, value in attrs:
            attr_dict[name] = value if value is not None else ""
        self.nodes.append({
            "tag": tag.lower(),
            "attrs": attr_dict,
            "line": line,
            "text": "",
        })

    def handle_data(self, data: str):
        # Attach text content to the most recent node
        if self.nodes and data.strip():
            self.nodes[-1]["text"] += data.strip()


def parse_source(source_code: str) -> List[Dict[str, Any]]:
    """
    Parse HTML/JSX source and return a flat node list.

    Args:
        source_code: Raw HTML or JSX string.

    Returns:
        List of node dicts with tag, attrs, line, text.
    """
    # Light JSX preprocessing: convert self-closing JSX tags,
    # strip curly-brace expressions (they break html.parser)
    import re
    # Keep the newlines that were inside each {...} so line numbers stay correct.
    cleaned = re.sub(
        r'\{[^}]*\}',
        lambda m: '"' + '\n' * m.group(0).count('\n') + '"',
        source_code,
    )

    parser = ASTNodeExtractor()
    try:
        parser.feed(cleaned)
    except Exception:
        pass  # best-effort: return whatever we parsed so far
    return parser.nodes
