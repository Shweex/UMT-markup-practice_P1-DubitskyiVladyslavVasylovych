"""Generate @2x and breakpoint-specific retina images for Flora."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"
RETINA = IMAGES / "retina"


def save_pair(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "JPEG", quality=85, optimize=True)
    img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS).save(
        path.with_name(f"{path.stem}@2x{path.suffix}"),
        "JPEG",
        quality=82,
        optimize=True,
    )


def cover_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    scale = max(target_w / img.width, target_h / img.height)
    resized = img.resize(
        (round(img.width * scale), round(img.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def generate_hero() -> None:
    src = Image.open(IMAGES / "hero-flowers.jpg")
    sizes = {
        "mobile": (768, 510),
        "tablet": (1024, 560),
        "desktop": (1440, 669),
    }
    for name, (w, h) in sizes.items():
        save_pair(cover_crop(src, w, h), RETINA / f"hero-flowers-{name}.jpg")


def generate_passion() -> None:
    src = Image.open(IMAGES / "passion-florist.jpg")
    sizes = {
        "mobile": (335, 419),
        "tablet": (352, 264),
        "desktop": (600, 450),
    }
    for name, (w, h) in sizes.items():
        save_pair(cover_crop(src, w, h), RETINA / f"passion-florist-{name}.jpg")


def generate_contact() -> None:
    src = Image.open(IMAGES / "contact-photo.jpg")
    sizes = {
        "mobile": (335, 312),
        "tablet": (704, 396),
        "desktop": (1152, 648),
    }
    for name, (w, h) in sizes.items():
        save_pair(cover_crop(src, w, h), RETINA / f"contact-photo-{name}.jpg")


def generate_bouquet_2x() -> None:
    for path in IMAGES.glob("bouquet-*.jpg"):
        if "@2x" in path.name:
            continue
        img = Image.open(path)
        out = path.with_name(f"{path.stem}@2x{path.suffix}")
        if not out.exists():
            img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS).save(
                out, "JPEG", quality=82, optimize=True
            )


def main() -> None:
    generate_hero()
    generate_passion()
    generate_contact()
    generate_bouquet_2x()
    print("Retina images generated in images/retina/")


if __name__ == "__main__":
    main()
