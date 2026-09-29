import os

from groq import Groq
from dotenv import load_dotenv

from app.vector_store import search_documents

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def ask_groq(question: str, memories=None):
    """
    Ask Groq using:
    1. Relevant uploaded documents (RAG)
    2. Previous conversation memories
    """

    # -----------------------------
    # Retrieve document context
    # -----------------------------
    document_context = ""

    try:
        relevant_chunks = search_documents(question)

        if relevant_chunks:
            document_context = "Relevant document context:\n\n"
            document_context += "\n\n".join(relevant_chunks)

    except Exception as e:
        print("Vector Search Error:", e)

    # -----------------------------
    # Build memory context
    # -----------------------------
    memory_context = ""

    if memories:
        memory_context = "Previous conversation memories:\n\n"

        for memory in memories:
            memory_context += (
                f"User: {memory['question']}\n"
                f"Assistant: {memory['answer']}\n\n"
            )

    # -----------------------------
    # Final prompt
    # -----------------------------
    prompt = f"""
You are OrgMind, an AI Organizational Memory Assistant.

Always follow this order:

1. Use the uploaded document context if it is relevant.
2. Use previous conversation memories if relevant.
3. If neither contains the answer, answer using your general knowledge.

-----------------------------
DOCUMENT CONTEXT
-----------------------------

{document_context}

-----------------------------
PREVIOUS MEMORIES
-----------------------------

{memory_context}

-----------------------------
CURRENT QUESTION
-----------------------------

{question}
"""

    response = client.chat.completions.create(
<<<<<<< HEAD
<<<<<<< HEAD
        model="openai/gpt-oss-20b",
=======
        model="llama-3.1-8b-instant",
>>>>>>> a75db40 (Completed professional frontend UI)
=======
        model="openai/gpt-oss-120b",
>>>>>>> f1be07c (Completed backend RAG pipeline)
        messages=[
            {
                "role": "system",
                "content": (
                    "You are OrgMind, an AI Organizational Memory Assistant. "
                    "Prefer information from uploaded documents, then conversation memory."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    return response.choices[0].message.content