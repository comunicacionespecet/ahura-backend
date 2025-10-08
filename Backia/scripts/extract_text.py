# scripts/extract_text.py
import pdfplumber
import docx
import pytesseract
from PIL import Image
import io

def extract_text_from_file(filename: str, contents: bytes) -> str:
    """
    Extrae texto de PDF, Word e imágenes (PNG, JPG, JPEG).
    """
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            texts = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(texts)
    elif filename.lower().endswith(".docx"):
        doc = docx.Document(io.BytesIO(contents))
        return "\n".join(p.text for p in doc.paragraphs)
    #elif filename.lower().endswith((".png", ".jpg", ".jpeg")):
    #    image = Image.open(io.BytesIO(contents))
    #    return pytesseract.image_to_string(image)
    else:
        raise ValueError(f"Formato no soportado: {filename}")