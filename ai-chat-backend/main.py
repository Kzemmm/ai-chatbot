from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# CORS: Allow React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "mistral"

class Message(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(message: Message):
    response = requests.post(OLLAMA_URL, json={
        "model": MODEL_NAME,
        "stream": False,  # Disable streaming
        "messages": [
            {"role": "user", "content": message.prompt}
        ]
    })

    print("OLLAMA RESPONSE:", response.text)

    if response.status_code == 200:
        json_response = response.json()
        reply = json_response.get("message", {}).get("content", "No reply received.")
        return {"response": reply}
    else:
        return {"error": "Ollama backend failed"}
