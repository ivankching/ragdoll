from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path
from fastapi import UploadFile
from typing import Union, NoReturn

load_dotenv(find_dotenv())
ROOT = Path(__file__).parent.parent

class Document:
    def __init__(self, id: str, title: str):
        self.id = id
        self.title = title

async def get_files() -> list[Path]:
    data_directory: Path = ROOT / os.environ["DATA_PATH"]
    items: list[Path] = data_directory.glob('**/*')
    return [Document(file.name, file.name) for file in items if file.is_file()]
    
async def upload_file(document: UploadFile):
    file_content = await document.read()
    data_directory: Path = ROOT / os.environ["DATA_PATH"]

    # Save to disk
    try:
        with open(f"{data_directory}/{document.filename}", "wb") as d:
            d.write(file_content)
        return True
    except:
        return False
    
async def delete_file(file_name: str) -> Union[None, NoReturn]:
    file_path: Path = ROOT / os.environ["DATA_PATH"] / file_name

    try:
        file_path.unlink()
    except OSError as e:
        raise(f"Error: {e}")