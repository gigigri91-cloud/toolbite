#!/usr/bin/env python3
"""Check external links referenced by the static site.

This script is intended for manual or scheduled CI use, not as a hard gate on every push.
It treats 403/405/429 as warnings because many sites block automated HEAD/GET requests.
"""

from __future__ import annotations

from html.parser import HTMLParser
from urllib import error, parse, request
import pathlib
import sys
import time


ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))
USER_AGENT = "ToolBiteLinkChecker/1.0 (+https://toolbite.org/)"
TIMEOUT_SECONDS = 10
RETRIES = 2
SOFT_STATUSES = {403, 405, 429}


class ExternalLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        rel_value = (attr_map.get("rel") or "").lower()
        for attr in ("href", "src", "action"):
            value = attr_map.get(attr)
            if value and value.startswith(("http://", "https://")):
                if tag == "link" and rel_value == "preconnect":
                    continue
                self.urls.add(value)


def collect_urls() -> list[str]:
    urls: set[str] = set()
    for html_file in HTML_FILES:
        parser = ExternalLinkParser()
        parser.feed(html_file.read_text(encoding="utf-8"))
        urls.update(parser.urls)
    return sorted(urls)


def make_request(url: str, method: str):
    req = request.Request(url, headers={"User-Agent": USER_AGENT}, method=method)
    return request.urlopen(req, timeout=TIMEOUT_SECONDS)


def check_url(url: str) -> tuple[str, int | None]:
    last_error: int | None = None
    methods = ["HEAD", "GET"]
    for method in methods:
        for attempt in range(RETRIES + 1):
            try:
                with make_request(url, method) as resp:
                    return "ok", resp.status
            except error.HTTPError as exc:
                last_error = exc.code
                if exc.code in SOFT_STATUSES:
                    return "warn", exc.code
                if exc.code in {301, 302, 303, 307, 308}:
                    return "ok", exc.code
            except Exception:
                last_error = None
            if attempt < RETRIES:
                time.sleep(0.5 * (attempt + 1))
    return "fail", last_error


def main() -> int:
    urls = collect_urls()
    failures: list[str] = []
    warnings: list[str] = []

    for url in urls:
        status, code = check_url(url)
        if status == "fail":
            failures.append(f"{url} ({code or 'network error'})")
        elif status == "warn":
            warnings.append(f"{url} ({code})")

    print(f"Checked {len(urls)} external URL(s).")
    if warnings:
        print(f"Warnings ({len(warnings)}):")
        for item in warnings[:30]:
            print(f"- {item}")
        if len(warnings) > 30:
            print(f"... and {len(warnings) - 30} more")
    if failures:
        print(f"Failures ({len(failures)}):")
        for item in failures[:30]:
            print(f"- {item}")
        if len(failures) > 30:
            print(f"... and {len(failures) - 30} more")
        return 1

    print("External link checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
