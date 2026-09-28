from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.llm import ask_groq

app = FastAPI(
    title="OrgMind API",
    version="1.0.0"
)

# Allow the React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "OrgMind Backend Running 🚀"
    }


@app.post("/ask")
def ask(question: Question):
    reply = ask_groq(question.question)
    return {
        "answer": reply
    }