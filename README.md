# AI Commerce Agent

Full-stack AI-powered shopping assistant for e-commerce.

**Tested on:**  
- Windows 11 (x86_64, Python 3.11, Node.js v22.17.1)  

## Features

- **ChatGPT-style conversational interface** — AI agent can answer questions, recommend products, and chat naturally with users.
- **Product recommendations** — Supports both text-based and image-based product search, powered by OpenAI GPT and CLIP.
- **Image search** — Upload a product photo or screenshot, and the agent will find visually similar items in a predefined catalog.

## Overview

- **Frontend:** Modern React app (Material-UI, Markdown, product cards, image upload)
- **Backend:** FastAPI + OpenAI GPT/CLIP/FAISS for chat and product/image search

## Project Structure

```

.
├── backend/          # Backend API (see backend/README.md)
├── frontend/         # Frontend UI (see frontend/README.md)
├── images/           # Product images (demo/research only, served by backend)
└── README.md         # (this file)

```

## Getting Started

See detailed setup in:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)

Typical workflow:

1. **Start backend API**  
   See [backend/README.md](backend/README.md) for Python, environment variables, GPU setup, etc.

2. **Start frontend**  
   See [frontend/README.md](frontend/README.md) for Node/npm setup and development usage.

3. Visit [http://localhost:3000](http://localhost:3000) to use the agent.

## Customization

- **Add/edit products:** Edit `backend/catalog.json`
- **Product images:** Place files in `/images/` at project root  
  (Images are for demo/research only; check copyright if deploying)

---

**For technical details, configuration, and contribution guidelines, see the respective README files above.**
