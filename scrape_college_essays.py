#!/usr/bin/env python3
"""
Scrape college essay prompts from International College Counselors.
Pulls every college on the website and writes to college_essays.json.
"""

import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = "https://internationalcollegecounselors.com/in-the-essay/"


def is_college_section(title: str) -> bool:
    """Skip Common App, Coalition, year tabs, etc. Keep only college sections."""
    skip = (
        "common application",
        "coalition application",
        "2024-2025",
        "2023-2024",
        "2025-2026",
        "need help",
        "recent acceptances",
        "essay prompts",
    )
    lower = title.lower()
    if any(p in lower for p in skip):
        return False
    # College if it contains University, College, Institute, or is Caltech
    return (
        "university" in lower
        or "college" in lower
        or "institute" in lower
        or lower == "caltech"
    )


def scrape_essays() -> dict[str, str]:
    """Scrape college essay sections from the 2025-26 tab only."""
    resp = requests.get(URL, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Get only the first tab pane (2025-2026)
    tabs = soup.find("div", class_="su-tabs")
    if not tabs:
        tabs = soup  # fallback to full page
    else:
        panes = tabs.find("div", class_="su-tabs-panes")
        if panes:
            pane_list = panes.find_all("div", class_="su-tabs-pane")
            if pane_list:
                tabs = pane_list[0]  # 2025-26 tab only

    essays = {}
    for spoiler in tabs.find_all("div", class_="su-spoiler"):
        title_el = spoiler.find("div", class_="su-spoiler-title")
        content_el = spoiler.find("div", class_="su-spoiler-content")
        if not title_el or not content_el:
            continue

        title = title_el.get_text(strip=True)
        if not is_college_section(title):
            continue

        content = content_el.get_text(separator="\n", strip=True)
        if content:
            essays[title] = content

    return essays


def main():
    base = Path(__file__).resolve().parent
    output_path = base / "college_essays.json"

    print("Scraping essay prompts...")
    essays = scrape_essays()
    print(f"Scraped {len(essays)} colleges")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(essays, f, indent=2, ensure_ascii=False)

    print(f"Wrote to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
