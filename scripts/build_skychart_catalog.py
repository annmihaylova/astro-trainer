from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


# The Bright Star Catalogue stores T CrB at its historical nova maximum
# (V = 2.0), not at its ordinary quiescent brightness. For a static sky
# chart this would create a large false naked-eye star beside Corona
# Borealis. Use its quiescent value instead.
VARIABLE_MAGNITUDE_OVERRIDES: dict[str, float] = {
    "T CrB": 10.8,
}


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
    variable_id = line[51:60].strip() or None

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

    display_magnitude = VARIABLE_MAGNITUDE_OVERRIDES.get(
        variable_id or "",
        float(magnitude),
    )

    return {
        "id": f"hr-{hr}",
        "hr": hr,
        "hd": hd,
        "name": name,
        "raDeg": round(ra_deg, 8),
        "decDeg": round(dec_deg, 8),
        "magnitude": round(display_magnitude, 3),
    }


def build_catalog(input_path: Path) -> list[dict[str, Any]]:
    stars: list[dict[str, Any]] = []

    with input_path.open("r", encoding="latin-1") as catalog_file:
        for raw_line in catalog_file:
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
