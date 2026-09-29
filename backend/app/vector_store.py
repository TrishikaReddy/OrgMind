import chromadb
from sentence_transformers import SentenceTransformer

client = chromadb.PersistentClient(path="./chromadb")

collection = client.get_or_create_collection("orgmind")

model = SentenceTransformer("all-MiniLM-L6-v2")


def store_document(filename, chunks):
    embeddings = model.encode(chunks).tolist()

    ids = [
        f"{filename}_{i}"
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=[
            {"file": filename}
            for _ in chunks
        ]
    )


def search_documents(query, k=5):
    embedding = model.encode([query]).tolist()[0]

    results = collection.query(
        query_embeddings=[embedding],
        n_results=k,
    )

    return results["documents"][0]