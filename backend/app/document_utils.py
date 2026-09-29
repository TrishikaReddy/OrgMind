from pathlib import Path
from pypdf import PdfReader
from docx import Document


def extract_text(file_path: str) -> str:
    """
    Extract text from PDF, DOCX and TXT files.
    """

    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf(file_path)

    elif extension == ".docx":
        return extract_docx(file_path)

    elif extension == ".txt":
        return extract_txt(file_path)

    else:
        raise ValueError(f"Unsupported file type: {extension}")


def extract_pdf(file_path: str) -> str:
    text = ""

    reader = PdfReader(file_path)

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()


def extract_docx(file_path: str) -> str:
    doc = Document(file_path)

    paragraphs = [
        paragraph.text
        for paragraph in doc.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs)


def extract_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()