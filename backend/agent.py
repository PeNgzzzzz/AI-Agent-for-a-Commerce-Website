import os
import json
import re
from collections import defaultdict
from PIL import Image
from openai import OpenAI

USE_MOCK = os.getenv("USE_MOCK_OPENAI")
if USE_MOCK:
    class DummyOpenAI:
        def __init__(self):
            self.chat = self
            self.completions = self
            self.embeddings = self
            self.files = self
            self.responses = self
        def create(self, **kwargs):
            if 'model' in kwargs and 'messages' in kwargs:
                return type("Obj", (), {"choices": [type("C", (), {"message": type("M", (), {"content": "Sorry, I'm a dummy response."})})]})
            if 'input' in kwargs:
                return type("Obj", (), {"output_text": "[]"})
            if 'input' in kwargs and 'model' in kwargs and kwargs['model'].startswith("text-embedding"):
                return type("Obj", (), {"data": [type("D", (), {"embedding": [0.0]*1536})]})
            return type("Obj", (), {"id": "file-123"})
    client = DummyOpenAI()
else:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

from .embeddings import get_text_embedding, get_image_embedding, find_similar_products_by_text, find_similar_products_by_image

# In-memory conversation history per user (IP or default)
CONVERSATION_MEMORY = defaultdict(list)

def add_to_memory(user_id: str, role: str, content: str):
    """
    Add a message to the user's conversation memory (keep last 10).
    """
    CONVERSATION_MEMORY[user_id].append({"role": role, "content": content})
    CONVERSATION_MEMORY[user_id] = CONVERSATION_MEMORY[user_id][-10:]

def get_system_prompt(user_name: str = "customer") -> str:
    """
    System prompt: shopping assistant persona for WilsonWear.
    """
    return (
        "Your name is BOT. "
        "You are the intelligent shopping assistant for WilsonWear, a sportswear and lifestyle apparel company. "
        "Your job is to help users find the best products from our catalog using text or image queries, "
        "and to answer any general questions in a helpful, branded, friendly tone. "
        f"You are currently helping {user_name} browse and discover products."
    )

def classify_intent(user_input: str) -> str:
    """
    Classify user's intent as 'product_recommendation' or 'general_chat'.
    """
    prompt = (
        'You are an AI assistant that helps route user queries. '
        'Classify the following message as either "product_recommendation" or "general_chat".\n\n'
        f'Message: "{user_input}"\nClassification (just output one word):'
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are a concise intent classifier."},
                      {"role": "user", "content": prompt}]
        )
        intent = response.choices[0].message.content.strip().lower()
    except Exception:
        intent = "general_chat"
    return intent

def clarify_user_query(user_input: str, user_id: str = "default") -> str:
    """
    Rewrite a user’s query into a clear product search query.
    """
    prompt = (
        "You are an intelligent shopping assistant. A user just said:\n\n"
        f"\"{user_input}\"\n\n"
        "Rewrite this input as a clear and concise product search query."
    )
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You rewrite vague user queries into precise product search phrases."},
                  {"role": "user", "content": prompt}]
    )
    clarified_query = response.choices[0].message.content.strip()
    add_to_memory(user_id, "assistant", f"(Clarified query: '{clarified_query}')")
    return clarified_query

def explain_recommendation(user_query: str, products: list, user_id: str = "default") -> str:
    """
    Generate a brief explanation of why products match a text-based user query.
    """
    if not products:
        return "I'm sorry, we couldn't find any products for that query."
    product_info = "\n".join([
        f"- {p['name']}: {p['description']} | Features: {', '.join(p['features'])}"
        for p in products
    ])
    prompt = (
        f'A user searched for: "{user_query}".\n\n'
        f"The following products were recommended:\n{product_info}\n\n"
        "Write a short paragraph explaining why these products match the user's needs."
    )
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a friendly AI shopping assistant explaining recommendations."},
                  {"role": "user", "content": prompt}]
    )
    reasoning = response.choices[0].message.content.strip()
    add_to_memory(user_id, "user", f"(User asked: Why were these products recommended for '{user_query}'?)")
    add_to_memory(user_id, "assistant", reasoning)
    return reasoning

def explain_search(products: list, user_id: str = "default") -> str:
    """
    Generate a brief explanation for image-based product search results.
    """
    if not products:
        return "I'm sorry, we couldn't find any products for that image."
    product_info = "\n".join([
        f"- {p['name']}: {p['description']} | Features: {', '.join(p.get('features', []))}"
        for p in products
    ])
    prompt = (
        "A user submitted an image query. Based on that image, you found the following visually similar products:\n"
        f"{product_info}\n\n"
        "Briefly discuss the products you found"
    )
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a friendly AI assistant explaining image search results."},
                  {"role": "user", "content": prompt}]
    )
    reasoning = response.choices[0].message.content.strip()
    add_to_memory(user_id, "user", "(User asked: Why were these products shown for my image?)")
    add_to_memory(user_id, "assistant", reasoning)
    return reasoning

def refine_text_matches(query: str, candidates: list) -> list:
    """
    Filter candidate products by text query using GPT.
    """
    product_info = "\n".join([
        f"- {p['name']} (ID: {p['id']}, Category: {p['category']}, Features: {', '.join(p.get('features', []))}) — {p['description']}"
        for p in candidates
    ])
    prompt = (
        f'A user asked for: "{query}".\n\n'
        "Here are candidate product matches:\n"
        f"{product_info}\n\n"
        "Return only an array of product IDs that are good matches (e.g., [\"p001\", \"p002\"])."
    )
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a product filter that selects relevant product matches."},
                  {"role": "user", "content": prompt}]
    )
    try:
        valid_ids = re.search(r"\[.*?\]", response.choices[0].message.content.strip(), flags=re.DOTALL)
        json_valid_ids = json.loads(valid_ids.group(0))
        if not json_valid_ids:
            return []
        refined = [p for p in candidates if p["id"] in json_valid_ids]
        return refined
    except Exception:
        return []

def refine_image_matches(original_img_path: str, candidates: list) -> list:
    """
    Filter candidate products by visual similarity using GPT-4V.
    """
    def upload_image_get_id(path: str):
        with open(path, "rb") as f:
            return client.files.create(file=f, purpose="vision").id
    try:
        original_file_id = upload_image_get_id(original_img_path)
    except Exception:
        return []
    vision_content = [
        {"type": "input_text", "text": "The user provided this image and some candidate product images. "
                                       "Identify which products are visually similar or match the style. "
                                       "Please return only an array of product IDs (e.g., [\"p001\", \"p002\"])."},
        {"type": "input_image", "file_id": original_file_id}
    ]
    for p in candidates:
        try:
            file_id = upload_image_get_id(p["image_path"])
        except Exception:
            continue
        vision_content.append({"type": "input_image", "file_id": file_id})
        vision_content.append({"type": "input_text", "text": f"{p['name']} (ID: {p['id']}) — {p['description']}. Features: {', '.join(p.get('features', []))}."})
    response = client.responses.create(
        model="gpt-4o-mini",
        input=[{"role": "user", "content": vision_content}]
    )
    try:
        valid_ids = re.search(r"\[.*?\]", response.output_text.strip(), flags=re.DOTALL)
        json_valid_ids = json.loads(valid_ids.group(0))
        if not json_valid_ids:
            return []
        refined = [p for p in candidates if p["id"] in json_valid_ids]
        return refined
    except Exception:
        return []

def get_agent_response(user_input: str, user_id: str = "default") -> dict:
    """
    Process a user text input and return the AI assistant's response.
    """
    intent = classify_intent(user_input)
    add_to_memory(user_id, "user", user_input)
    if intent == "product_recommendation":
        clarified_query = clarify_user_query(user_input, user_id)
        text_emb = get_text_embedding(clarified_query)
        candidates = find_similar_products_by_text(text_emb)
        refined_matches = refine_text_matches(clarified_query, candidates)
        explanation = explain_recommendation(clarified_query, refined_matches, user_id)
        return {
            "type": "recommendation",
            "response": explanation if refined_matches else "Sorry, no matching products were found.",
            "products": refined_matches
        }
    else:
        messages = [{"role": "system", "content": get_system_prompt()}] + CONVERSATION_MEMORY[user_id]
        completion = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
        assistant_reply = completion.choices[0].message.content.strip()
        add_to_memory(user_id, "assistant", assistant_reply)
        return {"type": "chat", "response": assistant_reply, "products": []}

def process_image_query(image_path: str, user_id: str = "default") -> dict:
    """
    Process an image query by finding similar products and generating a response.
    """
    try:
        img = Image.open(image_path).convert("RGB")
    except Exception:
        return {"type": "image-search", "response": "Could not process the image.", "products": []}
    query_emb = get_image_embedding(img)
    candidates = find_similar_products_by_image(query_emb)
    refined_matches = refine_image_matches(image_path, candidates)
    explanation = explain_search(refined_matches, user_id)
    return {
        "type": "image-search",
        "response": explanation if refined_matches else "Sorry, no visually similar products were found.",
        "products": refined_matches
    }
