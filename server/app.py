from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from rag.query_data import create_prompt, chat_model_response



class Query(BaseModel):
    content: str

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post('/query')
def query(query: Query):
    query_content = query.content
    prompt = create_prompt(query_content)
    response = chat_model_response(prompt)
    return response