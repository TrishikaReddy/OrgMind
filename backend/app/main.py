from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
<<<<<<< HEAD

=======
>>>>>>> a75db40 (Completed professional frontend UI)
from app.llm import ask_groq

app = FastAPI(
    title="OrgMind API",
    version="1.0.0"
)

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.get("/")
def home():
<<<<<<< HEAD
    return {
        "message": "OrgMind Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "OrgMind Backend"
    }

=======
    return {"message": "OrgMind Backend is Running!"}

@app.get("/health")
def health():
    return {"status": "healthy"}
>>>>>>> a75db40 (Completed professional frontend UI)

@app.post("/ask")
def ask(question: Question):
    reply = ask_groq(question.question)
<<<<<<< HEAD
    return {
        "answer": reply
    }
=======
    return {"answer": reply}
>>>>>>> a75db40 (Completed professional frontend UI)
