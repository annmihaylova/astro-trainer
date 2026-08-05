from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def parse_int(value: str) -> int | None:
    value = value.strip()
    if not value:
        return None

    try:
        return int(value)
    except ValueError:
        return None


def parse_float(value: str) -> float | None:
    value = value.strip()
    if not value:
        return None

    try:
        return float(value)
    except ValueError:
        return None


def parse_catalog_line(line: str) -> dict[str, Any] | None:
    hr = parse_int(line[0:4])
    name = line[4:14].strip() or None
    hd = parse_int(line[25:31])

    ra_hours = parse_float(line[75:77])
    ra_minutes = parse_float(line[77:79])
    ra_seconds = parse_float(line[79:83])

    dec_sign = line[83:84]
    dec_degrees = parse_float(line[84:86])
    dec_minutes = parse_float(line[86:88])
    dec_seconds = parse_float(line[88:90])

    magnitude = parse_float(line[102:107])

    required_values = (
        hr,
        ra_hours,
        ra_minutes,
        ra_seconds,
        dec_degrees,
        dec_minutes,
        dec_seconds,
        magnitude,
    )

    if any(value is None for value in required_values):
        return None

    if dec_sign not in {"+", "-"}:
        return None

    ra_deg = 15.0 * (
        float(ra_hours)
        + float(ra_minutes) / 60.0
        + float(ra_seconds) / 3600.0
    )

    dec_abs = (
        float(dec_degrees)
        + float(dec_minutes) / 60.0
        + float(dec_seconds) / 3600.0
    )
    dec_deg = dec_abs if dec_sign == "+" else -dec_abs

    return {
        "id": f"hr-{hr}",
        "hr": hr,
        "hd": hd,
        "name": name,
        "raDeg": round(ra_deg, 8),
        "decDeg": round(dec_deg, 8),
        "magnitude": round(float(magnitude), 3),
    }


def build_catalog(input_path: Path) -> list[dict[str, Any]]:
    stars: list[dict[str, Any]] = []

    with input_path.open("r", encoding="latin-1") as catalog_file:
        for line_number, raw_line in enumerate(catalog_file, start=1):
            line = raw_line.rstrip("\n\r")

            if len(line) < 107:
                continue

            star = parse_catalog_line(line)
            if star is None:
                continue

            stars.append(star)

    stars.sort(key=lambda star: int(star["hr"]))
    return stars


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Convert the fixed-width Bright Star Catalogue file "
            "into compact JSON for the Astro Trainer frontend."
        )
    )
    parser.add_argument(
        "input",
        type=Path,
        help="Path to catalog.txt",
    )
    parser.add_argument(
        "output",
        type=Path,
        help="Path to public/skycharts/stars.json",
    )
    args = parser.parse_args()

    stars = build_catalog(args.input)

    if not stars:
        raise RuntimeError(
            "No stars were parsed. Check that the input file uses "
            "the expected fixed-width catalogue format."
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(
            stars,
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )

    print(f"Saved {len(stars)} stars to {args.output}")


if __name__ == "__main__":
    main()
