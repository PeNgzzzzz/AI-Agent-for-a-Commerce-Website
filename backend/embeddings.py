import os
import json
import numpy as np
import faiss
from openai import OpenAI
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

# OpenAI client (API key from environment)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load catalog of products
CATALOG_PATH = os.path.join(os.path.dirname(__file__), "catalog.json")
with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    CATALOG = json.load(f)

# Set device for torch (use GPU if available)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load CLIP for image embeddings
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_model.eval()
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_fast=True)

def get_text_embedding(text: str) -> list:
    """
    Get a text embedding vector for a string using OpenAI embeddings API.
    """
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding

def get_image_embedding(image: Image.Image) -> np.ndarray:
    """
    Get an image embedding vector for a PIL Image using CLIP.
    """
    inputs = clip_processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        features = clip_model.get_image_features(**inputs)
    return features[0].cpu().numpy()

def build_faiss_index(embeddings: np.ndarray) -> faiss.IndexFlatL2:
    """
    Build a FAISS index for fast similarity search on embeddings.
    """
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype('float32'))
    return index

# Prepare text embeddings for catalog
_text_embeddings = []
for product in CATALOG:
    text_repr = (
        f"Category: {product['category']} "
        f"Name: {product['name']} "
        f"Description: {product['description']} "
        f"Features: {', '.join(product.get('features', []))} "
        f"Tags: {', '.join(product.get('tags', []))} "
        f"Use cases: {', '.join(product.get('use_cases', []))}"
    )
    emb = get_text_embedding(text_repr)
    _text_embeddings.append(emb)
TEXT_INDEX = build_faiss_index(np.array(_text_embeddings))

# Prepare image embeddings for catalog
_image_embeddings = []
for product in CATALOG:
    img_path = product.get('image_path') or product.get('image')
    if img_path and os.path.exists(img_path):
        img = Image.open(img_path).convert('RGB')
        emb = get_image_embedding(img)
    else:
        emb = np.zeros(TEXT_INDEX.d, dtype='float32')
    _image_embeddings.append(emb)
IMAGE_INDEX = build_faiss_index(np.array(_image_embeddings))

def find_similar_products_by_text(query_emb: list, top_k: int = 3) -> list:
    """
    Find top-k products whose text embeddings are closest to the query.
    """
    D, I = TEXT_INDEX.search(np.array([query_emb], dtype='float32'), top_k)
    return [CATALOG[i] for i in I[0]]

def find_similar_products_by_image(query_emb: np.ndarray, top_k: int = 3) -> list:
    """
    Find top-k products whose image embeddings are closest to the query.
    """
    D, I = IMAGE_INDEX.search(np.array([query_emb], dtype='float32'), top_k)
    return [CATALOG[i] for i in I[0]]
