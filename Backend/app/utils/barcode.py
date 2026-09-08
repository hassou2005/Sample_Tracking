import os
import barcode
from barcode.writer import ImageWriter
import logging

logger = logging.getLogger(__name__)

BARCODE_DIR = "generated/barcodes"


def generate_code128_barcode(sample_code: str) -> str:
    """
    Generates a Code 128 barcode image for the given sample code.
    Saves the output as a PNG file in the generated/barcodes directory.
    Returns the relative path to the generated file.
    """
    os.makedirs(BARCODE_DIR, exist_ok=True)
    
    code128_class = barcode.get_barcode_class("code128")
    
    # Custom writer options for clean barcode label display
    writer = ImageWriter()
    writer.format = "PNG"
    
    writer_options = {
        "module_width": 0.25,
        "module_height": 12.0,
        "font_size": 10,
        "text_distance": 4.0,
        "quiet_zone": 3.0,
        "write_text": False
    }
    
    file_base = os.path.join(BARCODE_DIR, sample_code)
    code_instance = code128_class(sample_code, writer=writer)
    
    output_path = code_instance.save(file_base, options=writer_options)
    logger.info(f"Generated Code 128 barcode at {output_path}")
    
    return f"/static/barcodes/{sample_code}.png"
