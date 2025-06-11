from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path
import shutil
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

ROOT = Path(__file__).parent.parent
CHROMA_PATH = f"{ROOT}/{os.environ["CHROMA_PATH"]}"
DATA_PATH = f"{ROOT}/{os.environ["DATA_PATH"]}"

def get_db():
    embedding_fn =  HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-l6-v2")
    db = Chroma(collection_name="knowledge_base", persist_directory=CHROMA_PATH, embedding_function=embedding_fn)
    return db

def load_documents():
    """Loads PDF files from data directory"""
    loader = PyPDFDirectoryLoader(DATA_PATH)
    documents: list[Document] = loader.load()
    for doc in documents:
        doc.metadata["filename"] = Path(doc.metadata["source"]).name
    return documents

def split_text(documents: list[Document]):
    """Splits documents into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap = 200,
        add_start_index=True
    )

    chunks: list[Document] = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks

def save_to_chroma(chunks: list[Document]):
    """Save vectors into Chroma database"""
    # Clear out the db directory first
    if os.path.exists(CHROMA_PATH):
        try:
            shutil.rmtree(CHROMA_PATH)
        except Exception as e:
            print(e)

    # Create a vector db from the documents
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-l6-v2")
    db = Chroma.from_documents(chunks, embeddings, persist_directory=CHROMA_PATH, collection_name="knowledge_base")
    print(f"Saved {len(chunks)} chunks to database in {CHROMA_PATH}.")


def generate_data_store():
    documents: list[Document] = load_documents()
    chunks: list[Document] = split_text(documents)
    save_to_chroma(chunks)

def add_document(document_filename: str):
    print(f"Loading file: {document_filename}")
    loader = PyPDFLoader(f"{DATA_PATH}/{document_filename}")
    document: Document = loader.load()
    for doc in document:
        doc.metadata["filename"] = Path(doc.metadata["source"]).name
    chunks: list[Document] = split_text(document)
    db: Chroma = get_db()

    db.add_documents(documents=chunks)
    print("Document added successfully")

def remove_document(document_filename: str):
    print(f"Deleting file {document_filename} from vector store")
    db: Chroma = get_db()
    collection: dict[str, any] = db.get()
    ids_to_delete = []

    for idx in range(len(collection['ids'])):
        id = collection['ids'][idx]
        metadata = collection['metadatas'][idx]

        if metadata['filename'] == document_filename:
            ids_to_delete.append(id)
    
    db.delete(ids=ids_to_delete)
    print(f"Deleted {len(ids_to_delete)} chunks from vector store")

if __name__ == '__main__':
    generate_data_store()

