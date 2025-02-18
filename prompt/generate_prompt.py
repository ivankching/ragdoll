import os
from dotenv import load_dotenv, find_dotenv
import argparse
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate

load_dotenv(find_dotenv())
ROOT = Path(__file__).parent.parent
PROMPT_TEMPLATE = """
Answer the question using only the following context:
{context}
-------------------------------------------------------------
Answer this question based on the context above: {question} 
"""

def query_db(query):
    embedding_fn =  HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-l6-v2")
    db = Chroma(persist_directory=f"{ROOT}/{os.environ["CHROMA_PATH"]}")

    results = db.similarity_search_with_relevance_scores(query, k=4)
    if len(results) == 0 or results[0][1]:
        print(f"Unable to find matching results for {query}")
        return
    
    return results

def create_prompt(query):
    context = query_db(query)
    context = "\n\n--\n\n".join([doc.page_content for doc, score in context])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context, question=query)
    print(prompt)
    return prompt

if __name__ == "__main__":
    # Command line input query
    parser = argparse.ArgumentParser()
    parser.add_argument("query", type=str, help="The query from user")
    args = parser.parse_args()
    query = args.query

    create_prompt(query)