from flask import Flask, request, jsonify
from pathlib import Path
from rag.query_data import create_prompt, chat_model_response

app = Flask(__name__)

@app.route("/")
def index():
    return "Index Page"

@app.post('/query')
def query():
    query = request.json['query']
    prompt = create_prompt(query)
    response = chat_model_response(prompt)
    return jsonify({"response": response.content})