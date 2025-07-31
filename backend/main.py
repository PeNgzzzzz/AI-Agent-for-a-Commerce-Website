from fastapi import FastAPI, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import tempfile

from .agent import get_agent_response, process_image_query, CONVERSATION_MEMORY

app = FastAPI()
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../images"))
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

# Allow local frontend and API on different ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request_data: ChatRequest, request: Request):
    """
    Handle a text chat request (general or product query).
    Uses the user's IP to identify their conversation memory session.
    Returns a dict with type, response, and (if any) recommended products.
    """
    user_id = request.client.host or "default"
    result = get_agent_response(request_data.message, user_id)
    return result

@app.post("/search-image")
async def search_image(file: UploadFile, request: Request):
    """
    Handle an image-based product search request.
    Accepts an image file, finds visually similar products, and returns explanation/results.
    """
    user_id = request.client.host or "default"
    content = await file.read()
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename or "upload.png")
    with open(file_path, "wb") as f:
        f.write(content)
    result = process_image_query(file_path, user_id)
    try:
        os.remove(file_path)
        os.rmdir(temp_dir)
    except OSError:
        pass  # Ignore cleanup errors
    return result

@app.post("/reset-memory")
async def reset_memory(request: Request):
    """
    Clear the conversation memory for the current user session.
    """
    user_id = request.client.host or "default"
    CONVERSATION_MEMORY[user_id] = []
    return {"type": "chat", "response": f"Memory for {user_id} cleared.", "products": []}
