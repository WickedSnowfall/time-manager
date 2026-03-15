from __future__ import annotations


def _display_seconds(total_seconds: int) -> int:
    if total_seconds <= 0:
        return 0
    return max(total_seconds, 60)


def format_hhmm(total_seconds: int) -> str:
    display_seconds = _display_seconds(total_seconds)
    hours = display_seconds // 3600
    minutes = (display_seconds % 3600) // 60
    return f"{hours:02d}:{minutes:02d}"


def format_summary(total_seconds: int) -> str:
    display_seconds = _display_seconds(total_seconds)
    hours = display_seconds // 3600
    minutes = (display_seconds % 3600) // 60
    return f"{hours} h {minutes:02d} m"
