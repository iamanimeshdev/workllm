# 🤖 AI Email & Calendar Assistant

A mini AI assistant that accepts natural language input, converts it into structured JSON via LLM, executes tools in a **while-loop** until the task is complete, and displays results in a premium chat UI.

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────┐     ┌──────────────┐
│  React + Vite   │────▶│  Express.js API              │────▶│  OpenRouter   │
│  (port 5173)    │◀────│  (port 3001)                 │◀────│  LLM API      │
└─────────────────┘     │                               │     └──────────────┘
                        │  ┌──────────────────────────┐ │
                        │  │ While-Loop Engine         │ │
                        │  │  1. Call LLM → get JSON   │ │
                        │  │  2. Validate schema       │ │
                        │  │  3. Execute tool (or ask) │ │
                        │  │  4. Loop if recall_memory │ │
                        │  └──────────────────────────┘ │
                        │  ┌──────────────────────────┐ │
                        │  │ In-Memory Key-Value Store │ │
                        │  └──────────────────────────┘ │
                        └───────────────────────────────┘
```

## JSON Output Schema

The LLM MUST return this exact format:

```json
{
  "tool": "send_email | draft_email | schedule_meeting | store_memory | recall_memory",
  "confidence": 0.95,
  "args": { ... },
  "missing_fields": [],
  "follow_up_question": null
}
```

## Features

- **Strict JSON mode**: LLM always returns structured JSON, safely parsed with fallbacks
- **While-loop execution**: Chains tool calls (e.g. recall_memory → send_email) until task is complete
- **5 Tools**: `send_email`, `draft_email`, `schedule_meeting`, `store_memory`, `recall_memory`
- **Memory system**: In-memory key-value store for remembering user info
- **Missing field detection**: Highlights missing fields + asks follow-up questions
- **Confidence scoring**: Visual confidence bar for each action
- **Pretty-print JSON**: Toggle raw JSON view in the UI

## Setup

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure API key

Copy the example and add your key:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=meta-llama/llama-4-maverick:free
PORT=3001
```

Get your API key from [openrouter.ai](https://openrouter.ai)

### 3. Start the app

```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

Open **http://localhost:5173**

## Example Requests

| Request | Tool(s) Called | Behavior |
|---------|---------------|----------|
| "Send an email to Rahul saying I'll be late" | `send_email` | Direct execution |
| "Draft an email to the design team about Friday's release" | `draft_email` | Direct execution |
| "Schedule a meeting with Priya tomorrow at 3pm" | `schedule_meeting` | Direct execution |
| "Send an email to someone" | `send_email` | Returns follow-up (missing: to, body) |
| "My manager is Rahul" | `store_memory` | Saves to memory |
| "Schedule a meeting with my manager" | `recall_memory` → `schedule_meeting` | While-loop: recall then schedule |

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + Radix UI
- **Backend**: Express.js (Node.js)
- **LLM**: OpenRouter API (any model — Llama, GPT, Claude, etc.)
- **Memory**: In-memory JavaScript Map

## ⚠️ Constraints

- No real Gmail/Calendar integration — mock responses only
- Memory resets on server restart
- All tool executions are simulated
