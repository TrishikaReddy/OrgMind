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

Your job is to answer questions using organizational knowledge.

Follow this priority:

1. Use relevant uploaded document context.
2. Use previous conversation memories if relevant.
3. If the provided context does not contain the answer, clearly say that
   the information was not found in the available organizational knowledge.
4. Do not invent facts about the organization.
5. Give clear and concise answers.

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

    # -----------------------------
    # Call Groq
    # -----------------------------
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are OrgMind, an AI Organizational Memory Assistant. "
                    "Use uploaded organizational documents and conversation "
                    "memory as the primary sources of information. "
                    "Do not fabricate organizational facts."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    return response.choices[0].message.content