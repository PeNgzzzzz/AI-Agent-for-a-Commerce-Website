# AI Commerce Agent — Frontend

React-based chat UI for e-commerce AI agents, featuring ChatGPT-style streaming replies, image search, and animated product cards.

## Features

- Typewriter animation for assistant replies
- Image upload & visual product search
- Product card recommendation (with animated entry)
- Markdown support for AI responses
- Modern, responsive UI (Material-UI, framer-motion)

## Quick Start

```bash
npm install
npm run dev
````

> Frontend dev server: [http://localhost:3000](http://localhost:3000)

* Backend API URL can be set via `.env` (`VITE_BACKEND_URL`)
* Needs backend endpoints `/chat` (text) and `/search-image` (image)

## Usage Highlights

* **Enter** = send message，**Shift+Enter** = newline (input auto-disables during AI reply)
* **Upload** images via "+" button, previews in chat before backend processing
* **AI reply** streams out one character at a time (typewriter effect)
* **Product cards** animate in when recommended
* **All fonts/styles** set in `index.css`

## Customization

* Edit card animation: `ProductCard.jsx`
* Edit message markdown: `MessageBubble.jsx`
* Change font/size: `index.css`
* Adjust chat width: `ChatWindow.jsx`

## Project Stack

* React 18
* Material-UI v5
* framer-motion
* react-markdown
* Vite

---

**See code comments for further customization.**
