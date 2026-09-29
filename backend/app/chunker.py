def chunk_text(text: str, chunk_size=500, overlap=100):
    """
    Split text into overlapping chunks.
    """

    chunks = []

    start = 0

    while start < len(text):
        end = start + chunk_size

        chunks.append(text[start:end])

        start += chunk_size - overlap

    return chunks