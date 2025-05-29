from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from rag.query_data import create_prompt, chat_model_response
from knowledge_base.file_management import get_files, upload_file, delete_file, get_filepath



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
async def read_root():
    return {"Hello": "World"}

@app.post('/query')
async def query(query: Query):
    query_content = query.content
    prompt = create_prompt(query_content)
    response = chat_model_response(prompt)
    return response

@app.get('/knowledge-base')
async def get_knowledge_base():
    return await get_files()

@app.post('/knowledge-base/upload')
async def upload_document(document: UploadFile):
    uploaded = await upload_file(document)
    if not uploaded:
        raise HTTPException(status_code=500, detail="Document upload failed")
        
    return {
        "document_title": document.filename,
        "message": "Document uploaded successfully"
    }

@app.delete("/knowledge-base/{filename}")
async def delete_document(filename: str):
    try:
        await delete_file(filename)

        return {
            "document_title": filename,
            "message": "Document deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Document deletion failed")
    
@app.get("/knowledge-base/{filename}")
async def download_document(filename: str):
    try:
        filepath = await get_filepath(filename)
        return FileResponse(filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Document retrieval failed")