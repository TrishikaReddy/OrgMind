from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.upload import router as upload_router
from app.database import init_db
from app.llm import ask_groq
from app.memory import save_memory, get_recent_memories

app = FastAPI()

# Register upload routes
app.include_router(upload_router)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "OrgMind Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "OrgMind Backend"
    }


@app.post("/ask")
def ask(question: Question):
    # Retrieve recent memories
    memories = get_recent_memories(5)

    # Generate AI response using memory + RAG
    answer = ask_groq(question.question, memories)

    # Save conversation
    save_memory(question.question, answer)

    return {
        "answer": answer
    }