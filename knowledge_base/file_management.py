from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path

load_dotenv(find_dotenv())
ROOT = Path(__file__).parent.parent

class Document:
    def __init__(self, id: str, title: str):
        self.id = id
        self.title = title

def get_files() -> list[Path]:
    data_directory: Path = ROOT / os.environ["DATA_PATH"]
    items: list[Path] = data_directory.glob('**/*')
    return [Document(file.name, file.name) for file in items if file.is_file()]
    