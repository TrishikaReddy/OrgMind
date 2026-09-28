# OrgMind

> An AI organizational memory agent that remembers how an organization works, detects when knowledge changes, and learns through human-confirmed updates using Hindsight.

## Overview

Organizations constantly evolve. Product launch dates change, responsibilities shift, policies are updated, and exceptions are introduced. Traditional AI assistants may remember information, but they often overwrite old knowledge without understanding how it changed.

OrgMind is designed to solve this problem.

Instead of simply storing information, OrgMind maintains an evolving organizational memory. It detects conflicts between previous and new knowledge, presents them to a human for confirmation, and updates its memory so future interactions reflect the latest organizational understanding.

## Core Memory Loop

```
REMEMBER
      ↓
RECALL
      ↓
DETECT
      ↓
EXPLAIN
      ↓
HUMAN CONFIRMS
      ↓
UPDATE
      ↓
LEARN
```

## Key Features

- 🧠 Long-term organizational memory powered by Hindsight
- 🔍 Conflict detection for changing organizational knowledge
- 👤 Human-in-the-loop conflict resolution
- 📚 Organizational DNA that evolves over time
- 🕒 Memory timeline showing how knowledge changes
- 💬 Natural language chat interface

## Example Workflow

### Step 1

User:

```
Product launch is June 15.
```

OrgMind stores the information.

---

### Step 2

User:

```
When is the product launch?
```

OrgMind replies:

```
June 15
```

---

### Step 3

User:

```
The product launch has been moved to July 15.
```

OrgMind detects:

```
⚠️ Potential Memory Conflict

Previous:
Launch Date → June 15

New:
Launch Date → July 15
```

The user confirms the update.

---

### Step 4

User asks again:

```
When is the product launch?
```

OrgMind now answers:

```
July 15
```

The previous memory is preserved as superseded rather than silently overwritten.

## Technology Stack

- React
- Vite
- Tailwind CSS
- Python (Backend)
- Groq LLM
- Hindsight (Long-Term Memory)
- GitHub

## Project Structure

```
OrgMind/
│
├── frontend/
├── backend/
├── docs/
├── README.md
└── PROJECT_CONTEXT.md
```

## Current Status

🚧 Currently under active development.

## Vision

OrgMind is more than an AI assistant with memory.

It is an evolving organizational memory system that understands how organizational knowledge changes over time, helping teams preserve context, manage change, and make better decisions.

---

Built using **Hindsight** for persistent AI memory.
