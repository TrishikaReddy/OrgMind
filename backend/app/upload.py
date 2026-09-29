import os
import shutil

from fastapi import APIRouter, File, UploadFile, HTTPException
from app.chunker import chunk_text
from app.vector_store import store_document

from app.document_utils import extract_text

router = APIRouter()

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    allowed_extensions = [".pdf", ".docx", ".txt"]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported.",
        )

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text(file_path)
    # Split the document into chunks
    chunks = chunk_text(extracted_text)
    # Store the chunks in ChromaDB
    store_document(file.filename, chunks)

    return {
    "filename": file.filename,
    "characters": len(extracted_text),
    "chunks": len(chunks),
    "message": "File uploaded and indexed successfully."
}