from os import getenv
from dotenv import load_dotenv, find_dotenv
import argparse
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
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
    db = Chroma(collection_name="knowledge_base", persist_directory=f"{ROOT}/{getenv("CHROMA_PATH")}", embedding_function=embedding_fn)

    results = db.similarity_search_with_relevance_scores(query, k=4)
    if len(results) == 0:
        print(f"Unable to find matching results for {query}")
        return
    
    return results

def create_prompt(query):
    context = query_db(query)
    if not context:
        print(f"No context")
        return
    context = "\n\n--\n\n".join([doc.page_content for doc, score in context])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context, question=query)
    print(prompt)
    return prompt

def chat_model_response(prompt):
    """Send prompt to chat model and get response"""
    llm = ChatOpenAI(
        openai_api_key=getenv("OPENROUTER_API_KEY"),
        openai_api_base=getenv("OPENROUTER_BASE_URL"),
        model_name="meta-llama/llama-3.3-70b-instruct:free"
    )
    response = llm.invoke(prompt)
    print(response.content)
    return response

if __name__ == "__main__":
    # Command line input query
    parser = argparse.ArgumentParser()
    parser.add_argument("query", type=str, help="The query from user")
    args = parser.parse_args()
    query = args.query

    prompt = create_prompt(query)
    response = chat_model_response(prompt)