"""Стиснення jpg у папці images."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "images"

LIMITS = {
    "hero-flowers.jpg": 1440,
    "contact-photo.jpg": 1280,
    "passion-florist.jpg": 700,
}

DEFAULT_MAX = 560


def max_width(name: str) -> int:
    if name in LIMITS:
        return LIMITS[name]
    return DEFAULT_MAX


def optimize(path: Path) -> None:
    before = path.stat().st_size
    with Image.open(path) as img:
        img = img.convert("RGB")
        limit = max_width(path.name)
        if img.width > limit:
            ratio = limit / img.width
            size = (limit, round(img.height * ratio))
            img = img.resize(size, Image.Resampling.LANCZOS)
        img.save(path, format="JPEG", quality=82, optimize=True, progressive=True)
    after = path.stat().st_size
    print(f"{path.name}: {before // 1024}KB -> {after // 1024}KB")


def main() -> None:
    for path in sorted(ROOT.glob("*.jpg")):
        optimize(path)


if __name__ == "__main__":
    main()
