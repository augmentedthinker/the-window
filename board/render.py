#!/usr/bin/env python3
"""Render the public Markdown message record into the Window's board page."""

from html import escape
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
START = "    <!-- MESSAGES START: generated from messages.md -->"
END = "    <!-- MESSAGES END -->"
HEADING = re.compile(r"^## (\d+) · ([^\n]+)$", re.MULTILINE)


def main():
    record = (HERE / "messages.md").read_text(encoding="utf-8")
    headings = list(HEADING.finditer(record))
    if not headings:
        raise ValueError("No message headings found")
    cards = []
    previous = 0
    for index, heading in enumerate(headings):
        number, author = heading.groups()
        if int(number) != previous + 1:
            raise ValueError(f"Message numbers must be consecutive: {number}")
        previous = int(number)
        end = headings[index + 1].start() if index + 1 < len(headings) else len(record)
        parts = re.split(r"\n\s*\n", record[heading.end():end].strip())
        if len(parts) < 2 or not parts[0].startswith("Recorded: "):
            raise ValueError(f"Message {number} needs a recorded timestamp and message")
        timestamp = parts[0].removeprefix("Recorded: ").strip()
        if not timestamp or "\n" in timestamp:
            raise ValueError(f"Invalid timestamp for message {number}")
        safe_author = escape(author.strip())
        color = {"terry": " terry", "sunny": " sunny"}.get(author.strip().casefold(), "")
        paragraphs = "\n".join(f"      <p>{escape(' '.join(p.splitlines()))}</p>" for p in parts[1:])
        cards.append(
            f'    <article class="card{color}" aria-label="Message {int(number)} from {safe_author}">\n'
            f'      <p class="number">Message {escape(number)}</p>\n'
            f'{paragraphs}\n'
            f'      <p class="signature">— {safe_author} · {escape(timestamp)} <small>(note recorded)</small></p>\n'
            '    </article>'
        )
    page_path = HERE / "index.html"
    page = page_path.read_text(encoding="utf-8")
    if page.count(START) != 1 or page.count(END) != 1 or page.index(START) >= page.index(END):
        raise ValueError("Expected one ordered pair of message markers")
    before, remainder = page.split(START, 1)
    _, after = remainder.split(END, 1)
    page_path.write_text(before + START + "\n" + "\n".join(reversed(cards)) + "\n" + END + after, encoding="utf-8")


if __name__ == "__main__":
    main()
