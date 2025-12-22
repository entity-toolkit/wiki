from __future__ import annotations
import argparse
from pathlib import Path
from typing import Tuple

from PIL import Image, ImageOps, ImageFile

# Allow extremely large images (avoid DecompressionBomb warnings for valid huge inputs).
Image.MAX_IMAGE_PIXELS = None
ImageFile.LOAD_TRUNCATED_IMAGES = True


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Create scaled transparent WebP derivatives from a PNG."
    )
    p.add_argument("input", type=Path, help="Path to the source PNG image.")
    p.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Directory to write WebP files (default: alongside input).",
    )
    # WebP encoding controls
    p.add_argument(
        "--quality",
        type=int,
        default=82,
        help="WebP quality (0-100) for lossy mode. Default: 82.",
    )
    p.add_argument(
        "--alpha-quality",
        type=int,
        default=100,
        help="Alpha channel quality (0-100) for lossy mode. Default: 100.",
    )
    p.add_argument(
        "--lossless",
        action="store_true",
        help="Use lossless WebP. Often larger, but exact transparency.",
    )
    p.add_argument(
        "--near-lossless",
        type=int,
        default=None,
        help="Near-lossless factor (0-100) for lossless mode (lower = smaller, more loss). Optional.",
    )
    p.add_argument(
        "--method",
        type=int,
        default=6,
        help="Compression effort (0=fast,6=best). Default: 6.",
    )
    return p.parse_args()


def ensure_rgba(img: Image.Image) -> Image.Image:
    """Convert to RGBA to guarantee an alpha channel is present for WebP transparency."""
    if img.mode == "RGBA":
        return img
    if img.mode in ("LA", "P"):
        return img.convert("RGBA")
    # For images without alpha, add an opaque alpha channel.
    if img.mode in ("RGB", "L"):
        return img.convert("RGBA")
    return img.convert("RGBA")


def scaled_size(size: Tuple[int, int], divisor: float) -> Tuple[int, int]:
    w, h = size
    new_w = max(1, round(w / divisor))
    new_h = max(1, round(h / divisor))
    return new_w, new_h


def save_webp(
    img: Image.Image,
    out_path: Path,
    *,
    quality: int,
    alpha_quality: int,
    method: int,
    lossless: bool,
    near_lossless: int | None,
) -> None:
    save_kwargs = {
        "format": "WEBP",
        "method": method,
    }

    if lossless:
        # Lossless mode; optionally near-lossless. 'quality' is respected with near-lossless.
        save_kwargs["lossless"] = True
        if near_lossless is not None:
            save_kwargs["near_lossless"] = int(near_lossless)
        # Preserve exact color of fully-transparent pixels to avoid fringes on compositing.
        save_kwargs["exact"] = True
        # Optional: some encoders also consider 'quality' with near_lossless; safe to pass.
        save_kwargs["quality"] = int(quality)
    else:
        # Lossy mode with explicit alpha quality for better edges.
        save_kwargs["quality"] = int(quality)
        save_kwargs["alpha_quality"] = int(alpha_quality)

    # Keep ICC profile and EXIF if present.
    if "icc_profile" in img.info:
        save_kwargs["icc_profile"] = img.info["icc_profile"]
    if "exif" in img.info:
        save_kwargs["exif"] = img.info["exif"]

    img.save(out_path, **save_kwargs)


def main():
    args = parse_args()
    input_path: Path = args.input
    out_dir = args.out_dir or input_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        raise FileNotFoundError(f"Input not found: {input_path}")

    # Open, fix orientation, ensure RGBA for transparency, and fully load.
    with Image.open(input_path) as im_orig:
        im = ImageOps.exif_transpose(im_orig)
        im = ensure_rgba(im)
        im.load()  # ensure it's fully decoded before resizing
        base = input_path.stem

        divisors = [1, 1.5, 2, 4]

        for d in divisors:
            new_w, new_h = scaled_size(im.size, d)
            resized = im.resize((new_w, new_h), resample=Image.Resampling.LANCZOS)

            # File name: <name>-div<factor>x.webp (e.g., photo-div1.5x.webp)
            factor_str = str(d).replace(".", "_")
            out_name = f"{base}-div{factor_str}x.webp"
            out_path = out_dir / out_name

            save_webp(
                resized,
                out_path,
                quality=args.quality,
                alpha_quality=args.alpha_quality,
                method=args.method,
                lossless=args.lossless,
                near_lossless=args.near_lossless,
            )

            print(f"Wrote {out_path}  ({im.size[0]}x{im.size[1]} -> {new_w}x{new_h})")

    print("Done.")


if __name__ == "__main__":
    main()
