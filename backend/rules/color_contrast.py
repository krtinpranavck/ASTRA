"""
color_contrast.py — Checks inline color/background-color for WCAG contrast.

WCAG 2.1 SC 1.4.3: Text must have a contrast ratio of at least 4.5:1 against
its background (3:1 for large text ≥ 18pt or 14pt bold).

NOTE: Only inline style attributes are analyzed. External CSS is not accessible
to a static parser, so this rule will not fire for classes like Tailwind utilities.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from .base import IRule

# Common CSS named colors → (R, G, B). None means "transparent / no color".
_NAMED: Dict[str, Optional[Tuple[int, int, int]]] = {
    "white": (255, 255, 255), "black": (0, 0, 0),
    "red": (255, 0, 0), "green": (0, 128, 0), "blue": (0, 0, 255),
    "yellow": (255, 255, 0), "orange": (255, 165, 0), "purple": (128, 0, 128),
    "gray": (128, 128, 128), "grey": (128, 128, 128), "silver": (192, 192, 192),
    "navy": (0, 0, 128), "teal": (0, 128, 128), "maroon": (128, 0, 0),
    "lime": (0, 255, 0), "aqua": (0, 255, 255), "cyan": (0, 255, 255),
    "fuchsia": (255, 0, 255), "magenta": (255, 0, 255), "pink": (255, 192, 203),
    "brown": (165, 42, 42), "beige": (245, 245, 220), "ivory": (255, 255, 240),
    "lavender": (230, 230, 250), "coral": (255, 127, 80), "salmon": (250, 128, 114),
    "gold": (255, 215, 0), "wheat": (245, 222, 179), "khaki": (240, 230, 140),
    "transparent": None, "inherit": None, "currentcolor": None,
}


def _parse_color(val: str) -> Optional[Tuple[int, int, int]]:
    val = val.strip().lower()
    if val in _NAMED:
        return _NAMED[val]
    # #RRGGBB
    m = re.match(r'^#([0-9a-f]{6})$', val)
    if m:
        h = m.group(1)
        return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    # #RGB shorthand
    m = re.match(r'^#([0-9a-f]{3})$', val)
    if m:
        h = m.group(1)
        return int(h[0] * 2, 16), int(h[1] * 2, 16), int(h[2] * 2, 16)
    # rgb() / rgba()
    m = re.match(r'^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', val)
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3))
    return None


def _luminance(r: int, g: int, b: int) -> float:
    """WCAG relative luminance formula."""
    def ch(c: int) -> float:
        s = c / 255.0
        return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def _contrast_ratio(
    c1: Tuple[int, int, int], c2: Tuple[int, int, int]
) -> float:
    l1, l2 = _luminance(*c1), _luminance(*c2)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def _extract_colors(
    style: str,
) -> Tuple[Optional[Tuple[int, int, int]], Optional[Tuple[int, int, int]]]:
    """Return (foreground_color, background_color) parsed from an inline style string."""
    color = bg = None
    for part in style.split(";"):
        if ":" not in part:
            continue
        prop, _, val = part.partition(":")
        prop = prop.strip().lower().replace(" ", "")
        val = val.strip()
        if prop == "color":
            color = _parse_color(val)
        elif prop in ("background-color", "background"):
            bg = _parse_color(val)
    return color, bg


class ColorContrastRule(IRule):

    @property
    def rule_id(self) -> str:
        return "color-contrast"

    @property
    def description(self) -> str:
        return "Text must have sufficient contrast against its background (WCAG 1.4.3)"

    @property
    def wcag_ref(self) -> str:
        return "1.4.3"

    @property
    def wcag_level(self) -> str:
        return "AA"

    def check(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        issues = []
        for node in nodes:
            style = node["attrs"].get("style", "")
            if not style:
                continue
            fg, bg = _extract_colors(style)
            if fg is None or bg is None:
                continue  # can't determine both colors — skip

            ratio = _contrast_ratio(fg, bg)

            if ratio < 3.0:
                issues.append({
                    "rule_id": self.rule_id,
                    "severity": "high",
                    "line": node["line"],
                    "message": (
                        f"<{node['tag']}> on line {node['line']} has a contrast ratio of "
                        f"{ratio:.2f}:1 — fails even for large text (minimum 3:1)"
                    ),
                    "recommendation": (
                        f"Raise the contrast ratio to at least 4.5:1 for normal text "
                        f"(3:1 for large text ≥ 18pt or bold 14pt). "
                        f"Use a tool like WebAIM Contrast Checker to find a passing color pair."
                    ),
                })
            elif ratio < 4.5:
                issues.append({
                    "rule_id": self.rule_id,
                    "severity": "medium",
                    "line": node["line"],
                    "message": (
                        f"<{node['tag']}> on line {node['line']} has a contrast ratio of "
                        f"{ratio:.2f}:1 — fails for normal-sized text (minimum 4.5:1)"
                    ),
                    "recommendation": (
                        f"Raise the contrast ratio to at least 4.5:1. "
                        f"Current ratio {ratio:.2f}:1 only passes for large text (≥ 18pt or bold 14pt). "
                        f"Use a tool like WebAIM Contrast Checker to pick a passing color."
                    ),
                })

        return issues
