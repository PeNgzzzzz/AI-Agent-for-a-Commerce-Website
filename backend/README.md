# AI Commerce Agent — Backend

FastAPI backend for e-commerce AI agent, supporting GPT chat and image-based product search.

## Features

- OpenAI GPT-powered chat & Q&A
- Image search (CLIP + FAISS)
- Serves product image URLs from project root images/

## Quick Start

Under the root folder (i.e., **AI-Agent-for-a-Commerce-Website**), run the following:

```bash
# For GPU acceleration, first manually install the appropriate CUDA version of PyTorch:
# See: https://pytorch.org/get-started/locally/
# Example for CUDA 12.8:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

# If using CPU only, you can skip the above command.
pip install -r requirements.txt

# Set environment variables:
# Linux/Mac:
export OPENAI_API_KEY=sk-...

# Windows (cmd):
set OPENAI_API_KEY=sk-...

# Windows (PowerShell):
$env:OPENAI_API_KEY="sk-..."
````

Start the server:

```bash
uvicorn backend.main:app --reload
```

* API root: [http://localhost:8000](http://localhost:8000)
* Product images: see project `images/` directory at the repo root

## Endpoints

| Endpoint      | Method | Description                |
| ------------- | ------ | -------------------------- |
| /chat         | POST   | Text/product chat (JSON)   |
| /search-image | POST   | Image-based product search |
| /reset-memory | POST   | Reset user conversation    |

## Env Vars

* `OPENAI_API_KEY` — Your OpenAI key (**required**)
* `USE_MOCK_OPENAI` — Any value for demo/offline mode

## Product Images & Copyright

* Product images are located at the repo root in `images/`.
* Images are collected from the internet and for demo/research only;
  if using this project publicly, please check and replace with your own assets as needed.

## Technology Choices & Rationale

* **FastAPI**
  A modern, high-performance web framework for building APIs with Python 3.7+. It provides automatic OpenAPI docs, async support, and excellent developer ergonomics.

* **OpenAI GPT (via openai-py)**
  Used for natural language conversation, product Q\&A, and recommendations. OpenAI’s models provide robust, production-ready language understanding with minimal setup.

* **CLIP + transformers**
  CLIP enables semantic image understanding and comparison; Huggingface’s `transformers` library allows easy integration and model management for both text and image pipelines.

* **FAISS**
  Facebook’s FAISS library enables fast, efficient vector similarity search for retrieving relevant products from the catalog based on embeddings.

* **Uvicorn**
  Lightweight ASGI server, pairs naturally with FastAPI for local development and production deployment.

* **Pillow**
  For robust image file handling and manipulation.

These choices provide a highly scalable, modern backend for AI-powered product chat and search, making it easy to extend or swap models and adapt to GPU/CPU setups as needed.

---

**Edit products in `catalog.json`.
See code comments for more info.**
