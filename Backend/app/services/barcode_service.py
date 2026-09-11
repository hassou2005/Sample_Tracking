import os
import io
import base64
from pathlib import Path
import logging

import barcode
from barcode.writer import ImageWriter
from PIL import Image, ImageDraw, ImageFont


logger = logging.getLogger(__name__)


# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Redirection vers /tmp sur Vercel (système de fichiers en lecture seule)
if os.environ.get("VERCEL"):
    BARCODE_DIR = Path("/tmp/generated/barcodes")
else:
    BARCODE_DIR = BASE_DIR / "generated" / "barcodes"


# ============================================================
# CUSTOM EXCEPTION
# ============================================================

class BarcodeGenerationError(Exception):
    """Raised when Code 128 barcode generation fails."""
    pass


# ============================================================
# SAFE FILE NAME
# ============================================================

def _safe_filename(value: str) -> str:
    """
    Convert a sample code into a Windows-safe filename.

    The sample code may contain characters such as '*', ':', '/',
    '\\', '?', etc. These characters must never be used directly
    in a Windows filename.

    The displayed sample code itself is NOT modified.
    """
    safe = "".join(
        "_" if char in '<>:"/\\|?*' else char
        for char in value
    )

    safe = safe.strip(" .")

    if not safe:
        safe = "barcode"

    return safe


# ============================================================
# BARCODE FILE PATH
# ============================================================

def get_barcode_file_path(sample_code: str) -> Path:
    """
    Get the absolute filesystem path for a sample barcode PNG.

    The filename is sanitized for Windows compatibility.
    """
    safe_code = _safe_filename(sample_code)
    return BARCODE_DIR / f"{safe_code}.png"


# ============================================================
# BARCODE EXISTENCE
# ============================================================

def barcode_exists(sample_code: str) -> bool:
    """Check if a valid barcode image already exists on disk."""

    file_path = get_barcode_file_path(sample_code)

    return (
        file_path.is_file()
        and file_path.stat().st_size > 0
    )


# ============================================================
# FONT HELPER
# ============================================================

def _get_font(size: int, bold: bool = False):
    """
    Try to load a readable system font.

    Falls back to PIL's default font if the requested font
    cannot be found.
    """

    possible_fonts = []

    if bold:
        possible_fonts = [
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/segoeuib.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
    else:
        possible_fonts = [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]

    for font_path in possible_fonts:
        try:
            if Path(font_path).is_file():
                return ImageFont.truetype(font_path, size=size)
        except Exception:
            continue

    return ImageFont.load_default()


# ============================================================
# GENERATE CODE 128 BARCODE
# ============================================================

def generate_barcode(
    sample_code: str,
    sample_name: str = "Sample",
) -> str:
    """
    Generate a Code 128 barcode image completely IN-MEMORY for a laboratory sample.

    Returns a Base64 Data URI string (data:image/png;base64,...).
    """

    # --------------------------------------------------------
    # Validate sample code
    # --------------------------------------------------------

    if not sample_code or not sample_code.strip():
        raise BarcodeGenerationError(
            "Sample code must be a non-empty string."
        )

    cleaned_code = sample_code.strip()

    # --------------------------------------------------------
    # Normalize displayed code
    # --------------------------------------------------------

    if not (
        cleaned_code.startswith("*")
        and cleaned_code.endswith("*")
    ):
        display_code = f"*{cleaned_code}*"
    else:
        display_code = cleaned_code

    try:
        # ====================================================
        # STEP 1 — GENERATE RAW CODE 128 IN-MEMORY (NO DISK FILE)
        # ====================================================

        code128_class = barcode.get_barcode_class("code128")

        writer = ImageWriter()
        writer.format = "PNG"

        writer_options = {
            "module_width": 0.35,
            "module_height": 14.0,
            "write_text": False,
            "quiet_zone": 6.5,
        }

        barcode_value = cleaned_code

        if (
            barcode_value.startswith("*")
            and barcode_value.endswith("*")
            and len(barcode_value) > 2
        ):
            barcode_value = barcode_value[1:-1]

        barcode_instance = code128_class(
            barcode_value,
            writer=writer,
        )

        # Génération du code-barres brut sous forme d'image PIL en mémoire RAM
        source_image = barcode_instance.render(writer_options).convert("RGB")

        # ====================================================
        # STEP 2 — ASSEMBLE LABEL IN-MEMORY
        # ====================================================

        barcode_width, barcode_height = source_image.size

        horizontal_padding = 35
        vertical_padding = 18

        header_height = 45
        middle_spacing = 18
        code_text_height = 40
        bottom_padding = 18

        label_width = max(
            barcode_width + horizontal_padding * 2,
            700,
        )

        label_height = (
            vertical_padding
            + header_height
            + middle_spacing
            + barcode_height
            + 12
            + code_text_height
            + bottom_padding
        )

        label = Image.new(
            "RGB",
            (label_width, label_height),
            "white",
        )

        draw = ImageDraw.Draw(label)

        header_font = _get_font(22, bold=True)
        sample_name_font = _get_font(18, bold=True)
        code_font = _get_font(17, bold=False)

        # Header Left
        draw.text(
            (horizontal_padding, vertical_padding),
            "ASARI Sample Tracking",
            fill="black",
            font=header_font,
        )

        # Header Right
        safe_sample_name = (
            str(sample_name).strip()
            if sample_name
            else "Sample"
        )

        if len(safe_sample_name) > 35:
            safe_sample_name = (
                safe_sample_name[:32] + "..."
            )

        right_bbox = draw.textbbox(
            (0, 0),
            safe_sample_name,
            font=sample_name_font,
        )

        right_text_width = (
            right_bbox[2] - right_bbox[0]
        )

        right_x = (
            label_width
            - horizontal_padding
            - right_text_width
        )

        draw.text(
            (right_x, vertical_padding + 2),
            safe_sample_name,
            fill="black",
            font=sample_name_font,
        )

        # Separator Line
        separator_y = (
            vertical_padding + header_height
        )

        draw.line(
            (
                horizontal_padding,
                separator_y,
                label_width - horizontal_padding,
                separator_y,
            ),
            fill="black",
            width=1,
        )

        # Paste Barcode Center
        barcode_x = (label_width - barcode_width) // 2
        barcode_y = separator_y + middle_spacing

        label.paste(
            source_image,
            (barcode_x, barcode_y),
        )

        # Draw Custom Display Code Under Barcode
        code_bbox = draw.textbbox(
            (0, 0),
            display_code,
            font=code_font,
        )

        code_width = (
            code_bbox[2] - code_bbox[0]
        )

        code_x = (label_width - code_width) // 2
        code_y = barcode_y + barcode_height + 8

        draw.text(
            (code_x, code_y),
            display_code,
            fill="black",
            font=code_font,
        )

        # ====================================================
        # STEP 3 — CONVERT TO BASE64 DATA URI IN-MEMORY
        # ====================================================

        buffer = io.BytesIO()
        label.save(
            buffer,
            format="PNG",
            optimize=True,
        )
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

        logger.info(
            "Successfully generated in-memory ASARI Code 128 label for sample '%s'",
            display_code,
        )

        return f"data:image/png;base64,{base64_str}"

    except Exception as exc:
        logger.error(
            "Failed to generate Code 128 barcode for sample '%s': %s",
            display_code,
            exc,
        )

        raise BarcodeGenerationError(
            f"Could not generate barcode for '{display_code}': {exc}"
        ) from exc