#!/usr/bin/env python3

from pathlib import Path
from datetime import date
import re

WORK_DIR = Path("src/content/work")

ITEM_RE = re.compile(r"^  - date:\s*(.*?)\s*$")
RANGE_RE = re.compile(
    r"(?<!\d)(\d{1,2})\s*[-–—]\s*(\d{1,2})/(\d{1,2})/(\d{4})(?!\d)"
)
DATE_RE = re.compile(
    r"(?<!\d)(\d{1,2})/(\d{1,2})/(\d{4})(?!\d)"
)


def clean_yaml_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def date_key(value: str):
    value = clean_yaml_scalar(value)

    # Esempio: 05-06/09/2026 -> usa 05/09/2026 come chiave.
    match = RANGE_RE.search(value)
    if match:
        day = int(match.group(1))
        month = int(match.group(3))
        year = int(match.group(4))
        try:
            return date(year, month, day).toordinal()
        except ValueError:
            return None

    match = DATE_RE.search(value)
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        year = int(match.group(3))
        try:
            return date(year, month, day).toordinal()
        except ValueError:
            return None

    return None


def sort_performances(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)

    if not lines or lines[0].strip() != "---":
        return False

    try:
        fm_end = next(
            i for i in range(1, len(lines))
            if lines[i].strip() == "---"
        )
    except StopIteration:
        return False

    perf_start = None
    for i in range(1, fm_end):
        if lines[i].rstrip("\r\n") == "performances:":
            perf_start = i
            break

    if perf_start is None:
        return False

    perf_end = fm_end
    for i in range(perf_start + 1, fm_end):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            continue

        # Una nuova chiave YAML di primo livello conclude performances.
        if not line.startswith((" ", "\t")):
            perf_end = i
            break

    block = lines[perf_start + 1:perf_end]

    starts = [
        i for i, line in enumerate(block)
        if ITEM_RE.match(line.rstrip("\r\n"))
    ]

    if len(starts) < 2:
        return False

    prefix = block[:starts[0]]
    items = []

    for pos, start in enumerate(starts):
        end = starts[pos + 1] if pos + 1 < len(starts) else len(block)
        chunk = block[start:end]

        match = ITEM_RE.match(chunk[0].rstrip("\r\n"))
        raw_date = match.group(1) if match else ""
        key = date_key(raw_date)

        items.append((chunk, key, pos, clean_yaml_scalar(raw_date)))

    # Date valide prima, dalla più recente alla più vecchia.
    # L'ordinamento Python è stabile per date uguali o non riconosciute.
    ordered = sorted(
        items,
        key=lambda item: (
            item[1] is not None,
            item[1] if item[1] is not None else -1
        ),
        reverse=True,
    )

    new_block = prefix + [
        line
        for chunk, _, _, _ in ordered
        for line in chunk
    ]

    if new_block == block:
        return False

    lines[perf_start + 1:perf_end] = new_block
    path.write_text("".join(lines), encoding="utf-8")

    print(f"Riordinate: {path}")
    for _, _, _, label in ordered:
        print(f"  - {label}")

    return True


def main():
    changed = False

    for path in sorted(WORK_DIR.glob("*.md")):
        changed = sort_performances(path) or changed

    if not changed:
        print("Nessuna rappresentazione da riordinare.")


if __name__ == "__main__":
    main()
