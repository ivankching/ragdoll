from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path
import shutil
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

ROOT = Path(__file__).parent.parent

def load_documents():
    """Loads PDF files from data directory"""
    loader = PyPDFDirectoryLoader(f"{ROOT}/{os.environ["DATA_PATH"]}")
    documents = loader.load()
    return documents

def split_text(documents):
    """Splits documents into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap = 200,
        add_start_index=True
    )

    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks

def save_to_chroma(chunks: list[Document]):
    """Save vectors into Chroma database"""
    chroma_path = f"{ROOT}/{os.environ["CHROMA_PATH"]}"
    # Clear out the db directory first
    if os.path.exists(chroma_path):
        shutil.rmtree(chroma_path)

    # Create a vector db from the documents
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-l6-v2")
    db = Chroma.from_documents(chunks, embeddings, persist_directory=chroma_path)
    db.persist()
    print(f"Saved {len(chunks)} chunks to database in {chroma_path}.")


def generate_data_store():
    documents = load_documents()
    chunks = split_text(documents)
    save_to_chroma(chunks)

if __name__ == '__main__':
    generate_data_store()

