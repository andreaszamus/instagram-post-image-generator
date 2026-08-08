from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
import os

def process_image(image_path, output_path, width_cm=15, height_cm=10):
    # Convert cm to pixels (assuming 300 DPI)
    dpi = 300
    width_px = int(width_cm / 2.54 * dpi)
    height_px = int(height_cm / 2.54 * dpi)

    # Open, resize, rotate
    img = Image.open(image_path)
    img = img.resize((width_px, height_px), Image.Resampling.LANCZOS)
    img = img.rotate(-90, expand=True)  # clockwise rotation

    # Preserve format based on extension
    ext = os.path.splitext(output_path)[1].lower()
    if ext == ".png":
        img.save(output_path, "PNG")
    else:
        img = img.convert("RGB")  # ensure no alpha channel for JPEG
        img.save(output_path, "JPEG")

def create_pdf(image_paths, pdf_path):
    # Create PDF canvas (A4 size)
    c = canvas.Canvas(pdf_path, pagesize=(21*cm, 29.7*cm))

    x, y = 2*cm, 15*cm
    for img_path in image_paths:
        c.drawImage(img_path, x, y, width=15*cm, height=10*cm)
        y -= 12*cm

    c.save()

# Example usage
process_image("image1.png", "processed1.png")
process_image("image2.png", "processed2.jpg")

create_pdf(["processed1.png", "processed2.jpg"], "output.pdf")
