import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

# Read the API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Debug (remove this later)
print("Groq Key Loaded:", "Yes" if GROQ_API_KEY else "No")

# Create the Groq client
client = Groq(api_key=GROQ_API_KEY)


def ask_groq(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response.choices[0].message.content