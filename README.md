# ⚡ Scholar Codex / PromptWars — AI-Augmented Research & Study Workstation

> **A modern, full-stack epistemological research and study platform powered by Google Gemini AI, interactive flashcards, draggable sticky note workspaces, file import/export pipelines, and hardened security middleware.**

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Key Architecture & Tech Stack](#-key-architecture--tech-stack)
3. [Core Features](#-core-features)
   - [Interactive Manuscript & Notes Editor](#1-interactive-manuscript--notes-editor)
   - [Draggable Sticky Notes Workspace](#2-draggable-sticky-notes-workspace)
   - [Gemini AI Research & Synthesis Engine](#3-gemini-ai-research--synthesis-engine)
   - [Interactive Mock Quiz System](#4-interactive-mock-quiz-system)
   - [File Import & Export Pipeline](#5-file-import--export-pipeline)
   - [Active Recall Study Cards](#6-active-recall-study-cards)
   - [AI Website Studio](#7-ai-website-studio)
   - [Production Security & Rate Limiting](#8-production-security--rate-limiting)
4. [Prerequisites & Getting Started](#-prerequisites--getting-started)
5. [Environment Configuration](#-environment-configuration)
6. [Running the Application](#-running-the-application)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Project Structure](#-project-structure)
9. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Overview

**Scholar Codex** (PromptWars) is an advanced scholarly environment designed for researchers, students, and engineers studying complex domains like philosophy, AI alignment, epistemological induction, and computer science.

It bridges the gap between **freeform note-taking**, **interactive AI dialogue**, **automated knowledge synthesis**, and **active-recall study cards**. Everything is built to be fast, responsive, and resilient—even when offline or running under strict API rate limits.

---

## 🛠️ Key Architecture & Tech Stack

- **Frontend:**
  - **React 19** with **TypeScript**
  - **Tailwind CSS v4** with a bespoke dark scholarly theme
  - **Google Fonts & Material Symbols**
  - **Web Audio API** synthesized audio engine for lecture recordings
  - Native Drag-and-Drop / Mouse Coordinates for Draggable Notes (zero external bloat)
- **Backend:**
  - **Node.js** with **Express** and **tsx**
  - **Vite Middleware Integration** (seamless single-server full-stack development)
  - In-memory rate limiting & OWASP security headers
  - Native ZIP stream generation for file exports
- **AI Engine:**
  - **Google Gen AI SDK (`@google/genai`)**
  - Model: `gemini-2.5-flash` (with automated offline fallbacks for rate-limited or keyless environments)
  - Structured JSON schema generation for Study Cards & Mock Quizzes

---

## 🚀 Core Features

### 1. Interactive Manuscript & Notes Editor
- **Direct-Typing Notes Box:** Always-visible, responsive writing area. Type, edit, and organize lecture notes or research essays without toggling modes.
- **Auto-Saving:** Automatically persists manuscript notes on blur and typing with instant visual feedback.
- **Formatting Toolbar:** Rich drafting tools including Bold, Italic, Headings, Scholarly Blockquotes, and citation anchors.
- **Contextual Selection:** Highlight any paragraph or sentence in your notes to immediately:
  - Synthesize an interactive **Activity Study Card**
  - Ask Gemini to **Explain** the concept in depth
  - **Challenge** the premise with rigorous philosophical counter-arguments

### 2. Draggable Sticky Notes Workspace
- **Movable Note Boxes:** Click "+ Sticky Note" to summon floating note cards that can be dragged anywhere on your screen.
- **Color Coding:** Switch between Gold, Rose, Emerald, and Amber color palettes for categorization.
- **Fold & Pin:** Minimize stickies into compact tabs to keep your desk tidy, or delete them when completed.
- **Instant Persistence:** Sticky note text is retained in real time.

### 3. Gemini AI Research & Synthesis Engine
- **Summarization (`/api/ai/summarize`):** One-click summarization of notes, essays, or imported papers into high-yield scholar digests with key takeaways.
- **Gemini Dialectic (`/api/chat`):** A conversational partner specialized in dialectic inquiry, counter-examples, and Socratic analysis.
- **Automatic Study Card Generator (`/api/gemini/generate-card`):** Extracts core concepts, active-recall prompts, source citations, and answer choices directly from your selected text.
- **Smart Failover:** If no `GEMINI_API_KEY` is provided or if quota limits are exceeded, the app automatically fails over to high-quality heuristic fallbacks so learning is never interrupted.

### 4. Interactive Mock Quiz System
- **Custom AI-Generated Quizzes (`/api/ai/quiz`):** Turn your notes into an interactive multiple-choice examination.
- **Instant Feedback & Scoring:** Select an answer to see instant green/red validation, scholarly rationale, and your cumulative score.

### 5. File Import & Export Pipeline
- **Import Text & Markdown (`/api/import/text-file`):** Upload `.txt`, `.md`, `.js`, `.py`, or `.html` files directly into your active workbook. The system parses them into ready-to-use manuscript notes and sources.
- **Export Archive (`/api/export/notes-zip`):** Download your entire workbook—including notes, citations, and study cards—as a clean, organized ZIP archive containing formatted Markdown files.

### 6. Active Recall Study Cards
- **Deck Inspection & Flashcards:** Flip cards to reveal answers, challenge points, and mastery badges (`MASTERED`, `IN REVIEW`, `RETEST`).
- **Spaced Repetition Tracking:** Record your performance (Hard, Good, Mastered) to update your workbook's mastery rate.

### 7. AI Website Studio
- Switch between **Manuscript Desk** and **Website Studio** with a single click.
- Create full interactive web pages from prompts or visual inspiration with live preview, code inspection, and asset management.

### 8. Production Security & Rate Limiting
- **Rate Limiting:**
  - Standard routes: Max 150 requests / minute per IP
  - AI & Gemini endpoints: Max 25 requests / minute per IP
- **OWASP Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Payload Sanitization:** Strictly typed Express route payloads and defensive fallbacks to prevent crashes or prototype pollution.

---

## 📦 Prerequisites & Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes bundled with Node.js)

### Installation
1. Clone or open the project folder in your terminal:
   ```bash
   cd "Promptwar-project"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🔑 Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

2. Open `.env` and set your Google Gemini API key:
   ```env
   # Google Gemini API Key (obtain from https://aistudio.google.com/)
   GEMINI_API_KEY="your_actual_gemini_api_key_here"

   # Server Port (default 3000)
   PORT=3000
   ```

> **Note:** The application will function with built-in scholar mock data and fallback generators even if no API key is specified. However, providing a valid Gemini API key unlocks the full power of `gemini-2.5-flash`.

---

## 🏃 Running the Application

### Development Mode (Recommended)
Start the unified Express + Vite development server:
```bash
npm run dev
```
Once started, open your browser and navigate to:
```
http://localhost:3000
```

### Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Rate Limit |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workbooks` | Fetch all study workbooks | 150 / min |
| `GET` | `/api/notes` | Fetch notes (optionally filter by `?workbookId=...`) | 150 / min |
| `POST` | `/api/notes` | Create a new study note | 150 / min |
| `PUT` | `/api/notes/:id` | Update note title, content, or annotations | 150 / min |
| `DELETE`| `/api/notes/:id` | Delete a note | 150 / min |
| `GET` | `/api/cards` | Fetch active study cards | 150 / min |
| `POST` | `/api/cards/:id/review`| Record spaced-repetition card review | 150 / min |
| `POST` | `/api/gemini/generate-card` | AI generation of a new study card | 25 / min |
| `POST` | `/api/ai/summarize` | AI text summarization with key takeaways | 25 / min |
| `POST` | `/api/ai/quiz` | AI generation of interactive mock quizzes | 25 / min |
| `POST` | `/api/import/text-file` | Import raw text/markdown file into a workbook note | 150 / min |
| `GET` | `/api/export/notes-zip` | Export workbook notes and cards as a downloadable `.zip` | 150 / min |
| `GET` | `/api/rate-limit/status`| Check current client rate limit quota | 150 / min |

---

## 📁 Project Structure

```
Promptwar-project/
├── .env.example             # Template for environment configuration
├── package.json             # Project dependencies and npm scripts
├── server.ts                # Express backend server, security middleware, and API routes
├── server/
│   └── gemini.ts            # Gemini 2.5 Flash SDK integration, structured schemas, & fallbacks
├── src/
│   ├── main.tsx             # React DOM entry point
│   ├── App.tsx              # Main application coordinator, state, and global modals
│   ├── types.ts             # TypeScript definitions for Workbooks, Notes, Cards, Sources
│   ├── index.css            # Global Tailwind styling and animation classes
│   ├── utils/
│   │   └── audio.ts         # Web Audio API engine for simulated scholarly tapes
│   └── components/
│       ├── ManuscriptDesk.tsx       # Core notes editor, AI action pills, summarize & quiz modals
│       ├── DraggableStickyNote.tsx  # Interactive movable sticky note boxes
│       ├── StudyCardDeck.tsx        # Active recall flashcards with flip & scoring
│       ├── GeminiDialectic.tsx      # Socratic AI chat companion
│       ├── WorkspaceRibbon.tsx      # Mode switcher, breadcrumb navigation, and quick tools
│       ├── TopNav.tsx               # Header with search, status indicators, and profile modal
│       ├── Sidebar.tsx              # Workbook and note explorer
│       ├── WebsiteStudio.tsx        # AI web design and live code preview studio
│       └── ...                      # Audio, Live Transcriber, and Source modals
└── vite.config.ts           # Vite build and development configuration
```

---

## 💡 Troubleshooting & FAQ

#### 1. "Gemini Quota Exceeded" or "Missing API Key"
- Verify that your `.env` file is named correctly (not `.env.txt`) and contains a valid `GEMINI_API_KEY`.
- If you hit Google's free-tier rate limits, the app automatically switches to fallback mode without crashing.

#### 2. Port 3000 is already in use
- Change the `PORT` in your `.env` file (e.g. `PORT=3001`), or pass an environment variable:
  ```powershell
  $env:PORT="3005"; npm run dev
  ```

#### 3. How do I export my notes?
- Click the **Export ZIP** button in the manuscript toolbar. The browser will instantly download a ZIP archive containing all your notes and study cards formatted in clean Markdown.

---

*Scholar Codex — Crafted for thinkers, researchers, and builders.*
