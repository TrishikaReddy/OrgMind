from fastapi import FastAPI
from app.llm import ask_groq

app = FastAPI(title="OrgMind API")

@app.get("/")
def home():
    return {"message": "OrgMind Backend Running"}

@app.get("/test-groq")
def test_groq():
    reply = ask_groq("In one sentence, what is organizational memory?")
    return {"response": reply}