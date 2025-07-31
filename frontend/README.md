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
cd frontend
npm install
npm run dev
````

> Frontend dev server: [http://localhost:3000](http://localhost:3000)

* Backend API URL can be set via `.env` (`VITE_BACKEND_URL`)
* Needs backend endpoints `/chat` (text) and `/search-image` (image)

## Usage Highlights

* **Enter** = send message，**Shift+Enter** = newline (input auto-disables during AI reply)
* **Upload** images via the camera button in the "+" menu. Previews appear in chat before backend processing.
* **AI reply** streams out one character at a time (typewriter effect)
* **Product cards** animate in when recommended
* **All fonts/styles** set in `index.css`

## Technology Choices & Rationale

* **React 18**
  Provides a declarative, component-driven framework with efficient rendering and a large ecosystem. React is ideal for building complex, dynamic single-page apps like a chat UI.

* **Material-UI v5**
  Delivers a modern, accessible, and customizable component library out-of-the-box. Makes it easy to create a visually appealing and responsive interface with minimal custom CSS.

* **framer-motion**
  Used for smooth, production-ready UI animations such as the typewriter effect and product card transitions. Enables easy, performant animation integration in React.

* **react-markdown**
  Allows flexible rendering of markdown content in assistant replies, supporting headings, lists, bold text, etc., for a richer AI chat experience.

* **Vite**
  Next-generation frontend tooling for super-fast development and hot module replacement. Makes the local dev workflow smooth and keeps build configuration simple.

These technologies were chosen to balance **developer productivity, user experience,** and **modern web standards.**
React + Material-UI offer a robust base for interactive UIs, while framer-motion and react-markdown add polish and flexibility for AI-centric chat and product experiences.

---

**See code comments for more info.**
