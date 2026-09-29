import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def ask_groq(prompt: str):
    response = client.chat.completions.create(
<<<<<<< HEAD
        model="openai/gpt-oss-20b",
=======
        model="llama-3.1-8b-instant",
>>>>>>> a75db40 (Completed professional frontend UI)
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content