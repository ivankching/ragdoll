from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path

load_dotenv(find_dotenv())
ROOT = Path(__file__).parent.parent

def get_files() -> list[Path]:
    data_directory: Path = ROOT / os.environ["DATA_PATH"]
    items: list[Path] = data_directory.glob('**/*')
    return [file.name for file in items if file.is_file()]
    