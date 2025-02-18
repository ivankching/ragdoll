import os
from dotenv import load_dotenv, find_dotenv
import argparse
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

ROOT = Path(__file__).parent.parent

def query_db(query):
    embedding_fn =  HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-l6-v2")
    db = Chroma(persist_directory=f"{ROOT}/{os.environ["CHROMA_PATH"]}")

    results = db.similarity_search_with_relevance_scores(query, k=4)
    if len(results) == 0 or results[0][1]:
        print(f"Unable to find matching results for {query}")
        return
    
    return results