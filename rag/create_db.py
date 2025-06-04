from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path
import shutil
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from chromadb import PersistentClient

ROOT = Path(__file__).parent.parent

def load_documents():
    """Loads PDF files from data directory"""
    loader = PyPDFDirectoryLoader(f"{ROOT}/{os.environ["DATA_PATH"]}")
    documents: list[Document] = loader.load()
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
    chroma_path = f"{ROOT}/{os.environ["CHROMA_PATH"]}"
    # Clear out the db directory first
    if os.path.exists(chroma_path):

        try:
            chroma_client = PersistentClient(path=chroma_path)
            chroma_client.delete_collection("knowledge_base")
            print("Knowledge base deleted successfully")
        except:
            print("No knowledge base to delete")

        # Temporary fix to windows specific(?) issue. Will revisit when trying to containerize
        # Will only delete on app restart due to antivirus(?) on windows
        try:
            shutil.rmtree(chroma_path)
        except Exception as e:
            print(e)

    # Create a vector db from the documents
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-l6-v2")
    db = Chroma.from_documents(chunks, embeddings, persist_directory=chroma_path, collection_name="knowledge_base")
    print(f"Saved {len(chunks)} chunks to database in {chroma_path}.")


def generate_data_store():
    documents = load_documents()
    chunks = split_text(documents)
    save_to_chroma(chunks)

if __name__ == '__main__':
    generate_data_store()

