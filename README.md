# 🎓 AI-Powered Adaptive Academic Learning Platform

> **"Don't make the learner fit the system. Make the system fit the learner."**

An adaptive learning platform that understands each learner's academic level, interests, existing knowledge, and learning behaviour, then dynamically personalizes explanations, practice, difficulty, and learning path. When a learner demonstrates real mastery, the platform issues a **blockchain-verifiable certificate**.

**Status:** Hackathon MVP (v1.0) · **Demo subject:** Data Structures & Algorithms (DSA)

---

## 📌 Table of Contents

- [Problem](#-problem)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Learner Model](#-learner-model)
- [Personalization Rules](#-personalization-rules)
- [Mastery & Certification](#-mastery--certification)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Screens](#-screens)
- [Getting Started](#-getting-started)
- [Project Structure](#-suggested-project-structure)
- [Security & Privacy](#-security--privacy)
- [Error Handling](#-error-handling)
- [MVP Scope](#-mvp-scope)
- [Hackathon Demo Flow](#-hackathon-demo-flow)
- [Roadmap](#-roadmap)
- [Core Principles](#-core-principles)

---

## ❗ Problem

Most platforms give every learner the same content, sequence, explanations, assessments, difficulty curve, and interface. But students differ in background, pace, strengths, weaknesses, interests, and preferences.

> Students are expected to adapt to the learning system instead of the system adapting to the students.

## 💡 Solution

The platform builds a **dynamic learner model** and uses it to personalize the experience through a continuous loop:

```
Observe → Understand → Decide → Adapt → Evaluate → Update Learner Model → Adapt Again
```

Unlike a generic AI chatbot or static course platform, it adapts the **learning environment and learning path**, not just the answers.

---

## ✨ Key Features

| Area | What it does |
|---|---|
| **Onboarding** | Short questionnaire (level, goal, explanation style, interests, difficult areas) + 5–10 question diagnostic assessment |
| **Learner Model** | Continuously updated profile of level, strengths, weak areas, interests, preferences |
| **Adaptive Content** | Explanations tailored by style, difficulty, and learner interests (e.g. railway or gaming analogies for graphs) |
| **Personalized Practice** | AI-generated MCQs, coding, conceptual, numerical, scenario-based, revision, and challenge problems |
| **Behaviour Tracking** | Accuracy, completion time, attempts, repeated mistakes, hints used, skipped questions |
| **Adaptive UI** | Predefined UI configs (font size, density, hints, content per page, visual mode) |
| **Progress Dashboard** | Overall/topic progress, mastery, weak & strong areas, recommendations, achievements |
| **Mastery System** | Certification requires demonstrated understanding, not just completion |
| **Certificates** | Auto-generated Certificate of Mastery with unique ID |
| **Public Verification** | Anyone can verify a certificate by ID against a blockchain proof |

---

## 🔄 How It Works

### First-time user journey

1. **Sign up / Log in** (Supabase Auth)
2. **Select academic level**: Classes 1–10, 11–12, Undergraduate, Postgraduate
3. **Select subject**: DSA, OOP, Web Dev, AI/ML, Data Science, DBMS, OS, Computer Networks
4. **Select topic**: Arrays, Strings, Linked Lists, Stack, Queue, Trees, Graphs, Sorting, Searching
5. **Short questionnaire**: knowledge level, goal, preferred explanation, interests, difficult areas
6. **Diagnostic assessment**: records accuracy, time, attempts, mistakes, hints, skips
7. **Initial learner state** is created and the personalized dashboard unlocks

### Personalization example: Graph Algorithms

| Concept | 🚆 Railway-interested learner | 🎮 Gaming-interested learner |
|---|---|---|
| Node | Station | Game location |
| Edge | Railway track | Movement path |
| Weight | Travel time | Movement cost |
| Shortest path | Fastest route | Optimal game route |

Same academic concept, different learning experience.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS, React Router, Recharts, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase PostgreSQL |
| **Auth & Security** | Supabase Auth, Row Level Security (RLS) |
| **Storage** | Supabase Storage (where required) |
| **AI** | LLM API + AI orchestration + rule-based personalization |
| **Blockchain** | Testnet, used **only** for certificate verification |
| **Dev Environment** | Antigravity |
| **Deployment** | Vercel (frontend), Render/Railway (backend), Supabase (DB/Auth) |

---

## 🧠 Architecture

```
Student
  ↓
Behaviour
  ↓
Learner Model
  ↓
AI Orchestrator
  ├── Learning Agent
  ├── Activity Agent
  └── Adaptive UI Agent
  ↓
Personalized Experience
  ↓
New Behaviour → Updated Learner Model
```

### AI components

**Learning Agent**: recommends next topics, generates explanations, selects examples, adapts explanation style, recommends revision and resources.

**Activity Agent**: generates MCQs, coding, conceptual, and scenario-based questions, adjusting difficulty using topic, level, past performance, mistakes, interests, and difficulty preference.

**Adaptive UI Agent**: selects from *predefined* UI configurations only:

```json
{
  "fontSize": "large",
  "density": "low",
  "contentPerPage": 1,
  "hintsEnabled": true,
  "visualMode": true
}
```

> ⚠️ The LLM **never** generates arbitrary CSS or frontend code. The frontend accepts only whitelisted config values.

For the MVP, personalization uses **rule-based logic + LLM reasoning**, not complex ML.

---

## 👤 Learner Model

```json
{
  "educationLevel": "undergraduate",
  "subject": "DSA",
  "currentLevel": "intermediate",
  "interests": ["railway"],
  "preferredExplanation": "real-world examples",
  "strengths": ["arrays", "strings"],
  "needsPractice": ["graphs"],
  "difficultyPreference": "medium"
}
```

The model is dynamic, updated from new behavioural data, and **never treated as a permanent label** of the learner.

### Adaptive learning path

```
Default:     Arrays → Strings → Linked Lists → Stack & Queue → Trees → Graphs

Struggling:  Concept Revision → Simpler Explanation → Example → Easy Practice → Reassessment

Excelling:   Increase Difficulty → Advanced Problem → Challenge
```

---

## 📏 Personalization Rules

| Signal | Adaptation |
|---|---|
| **Consistently low accuracy** | Reduce difficulty, add explanation, recommend prerequisite concepts |
| **Repeated mistakes on a concept** | Identify the concept gap, provide revision, generate easier practice |
| **Slow completion times** | Step-by-step explanations, reduced information density |
| **Consistently high performance** | Increase difficulty, provide advanced problems |
| **Known interest** | Use relevant examples where appropriate |

---

## 🏆 Mastery & Certification

Completion alone does **not** earn a certificate. Mastery considers topic assessments, practice performance, concept understanding, problem-solving, application, and a final assessment.

**Example score breakdown**

```
Concept Understanding   85%
Problem Solving         82%
Application             88%
Final Assessment        86%
─────────────────────────────
Overall Mastery         85%
```

**MVP certification rule (configurable):**

```
Overall Mastery >= 80%
AND Final Assessment >= 75%
AND Required Topics Completed
```

If not met: **More Practice → Revision → Reassessment**.

### Certificate contents

Student name · Subject · Achievement · Mastery score · Completion date · Certificate ID (e.g. `CERT-DSA-2026-00125`) · Platform name · Verification mechanism

### Blockchain verification

Blockchain is used **only** for authenticity, not as general storage.

| Stored in Supabase | Stored on blockchain |
|---|---|
| Student profile | Certificate hash / proof |
| Learning progress | Certificate ID |
| Assessment results | Timestamp |
| Mastery data | Verification reference |
| Certificate metadata | |

🔒 Sensitive student data is **never** stored on-chain.

### Public verification page

Enter a certificate ID → system checks the record and blockchain proof →

```
✓ Certificate Verified
Certificate: DSA Mastery
Status:      Authentic
Issued:      October 2026
```

Only minimal information is shown; no unnecessary personal data is exposed.

---

## 🗄 Database Schema

Kept minimal for the MVP (Supabase PostgreSQL):

| Table | Purpose |
|---|---|
| `users` | Basic account info |
| `learner_profiles` | Education level, current level, goals, interests, preferences |
| `subjects` | Available subjects |
| `topics` | Topics per subject |
| `learner_subjects` | Learner ↔ subject mapping |
| `assessments` | Assessment definitions |
| `assessment_questions` | Questions |
| `assessment_attempts` | Learner answers and performance |
| `learning_progress` | Topic progress and mastery |
| `activity_attempts` | Practice activity performance |
| `learner_behaviour` | Behavioural signals |
| `ui_preferences` | Current adaptive UI config |
| `achievements` | Learner achievements |
| `certificates` | Certificate metadata |
| `certificate_verifications` | Verification records (if required) |

Each activity attempt records: question, topic, difficulty, student answer, correct answer, time, attempts, hints, result.

---

## 🔌 API Endpoints

*Implement only what the MVP actually needs.*

```
# Auth
POST /auth/signup
POST /auth/login

# Content
GET  /subjects
GET  /subjects/:id/topics

# Assessment
POST /assessment/start
POST /assessment/submit

# Learner
GET  /learner/profile
GET  /learner/progress

# Activities & AI
POST /activity/generate
POST /activity/submit
POST /ai/adapt
GET  /recommendations

# Certificates
GET  /certificates
POST /certificates/generate
GET  /certificates/:certificateId
GET  /verify/:certificateId        # public
```

---

## 🖥 Screens

**Public:** Landing · Login · Signup · Certificate Verification

**Onboarding:** Academic Level · Subject Selection · Topic Selection · Learning Preferences · Interests · Diagnostic Assessment

**Main app:** Personalized Dashboard · Subject Page · Lesson Page · Practice/Activity Page · Results Page · Progress Page · Learner Profile · Achievements · Certification Page · Certificate Preview

The dashboard shows overall progress, a "Continue Learning" card, recommendations with *why* they were recommended, mastery per topic, and certification status.

---

## 🚀 Getting Started

> The PRD does not define repo-specific commands. The steps below are a suggested setup. Adjust to your actual repository.

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An LLM API key
- A blockchain testnet wallet/RPC (for certificate anchoring)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <project-folder>

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Configure environment variables

**`backend/.env`**

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LLM_API_KEY=your_llm_api_key
BLOCKCHAIN_RPC_URL=your_testnet_rpc_url
BLOCKCHAIN_PRIVATE_KEY=your_wallet_private_key
```

**`frontend/.env`**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

> 🔐 API keys must **never** appear in frontend code. Only the public Supabase anon key belongs in the frontend.

### 3. Set up the database

Create the tables listed above in Supabase, enable **Row Level Security** on all learner-data tables, and seed `subjects` and `topics` (start with DSA).

### 4. Run locally

```bash
# Terminal 1: backend
cd backend && npm run dev

# Terminal 2: frontend
cd frontend && npm run dev
```

### 5. Deploy

- **Frontend** → Vercel
- **Backend** → Render or Railway
- **Database/Auth** → Supabase

---

## 📂 Suggested Project Structure

```
.
├── frontend/
│   └── src/
│       ├── pages/          # Landing, Onboarding, Dashboard, Lesson, Practice, Verify...
│       ├── components/
│       ├── hooks/
│       ├── lib/            # Supabase client, API client
│       └── config/         # Whitelisted adaptive UI configs
├── backend/
│   └── src/
│       ├── routes/
│       ├── services/
│       │   ├── orchestrator/    # AI Orchestrator
│       │   ├── learningAgent/
│       │   ├── activityAgent/
│       │   ├── adaptiveUI/
│       │   ├── rules/           # Rule-based personalization
│       │   ├── mastery/
│       │   └── certificate/     # Generation + blockchain anchoring
│       └── middleware/          # Auth, RBAC
└── README.md
```

---

## 🔐 Security & Privacy

- Supabase Authentication
- Row Level Security on learner data
- Protected API endpoints and role-based authorization where needed
- Secure environment variables; no API keys in frontend code
- Minimal collection of personal data
- No sensitive data on-chain
- Student data accessible only to authorized users

---

## 🛡 Error Handling

| Failure | Behaviour |
|---|---|
| Authentication | Clear error message |
| AI | Fallback content so the lesson never breaks |
| Database | Retry option |
| Assessment | Preserve completed answers where possible |
| Certificate generation | Retry without losing mastery information |
| Blockchain | Certificate issuance continues; anchoring can complete later |

---

## 📊 Analytics: Proving Adaptation

The platform tracks enough data to show that adaptation actually happened:

Initial assessment score · subsequent assessment score · accuracy · completion time · attempts · hints · difficulty changes · topic mastery · final mastery · learning progression

The demo should show **Before adaptation → Adaptation → After adaptation**.

---

## 🎯 MVP Scope

### ✅ Must have
Signup/Login · Academic level selection · Subject/topic selection · Short questionnaire · Diagnostic assessment · Learner profile · Personalized dashboard · Learning content · Personalized practice · Behaviour tracking · Rule-based adaptation · AI-generated explanations/questions · Progress tracking · Mastery calculation · Certificate generation · Certificate verification

### 🟡 Should have
Adaptive UI configuration · Multiple learning paths · Achievements · Better recommendations · Blockchain verification · PDF certificates · More subjects

### 💭 Nice to have
Advanced ML personalization · Embeddings/vector search · Contextual bandits · Voice learning · Advanced gamification · Teacher/institution dashboards · Mobile app

*Do not build these if they threaten MVP completion.*

### 🚫 Non-goals
- Diagnosing learning disabilities or measuring intelligence
- Permanently labelling students as weak or strong
- Replacing teachers or building a full LMS
- Training a foundation model or complex ML models
- Storing sensitive data on-chain
- AI-generated arbitrary frontend code
- Supporting every subject, excessive gamification, or enterprise/admin systems

---

## 🎬 Hackathon Demo Flow

Follow **one learner** through the full product loop:

1. Student selects **Undergraduate → DSA → Graphs**
2. Declares interest: **Railway**
3. Diagnostic finds: graph fundamentals *good*, weighted graphs *weak*
4. Platform teaches graphs using railway stations and routes
5. Student struggles with weighted graphs → repeated mistakes detected
6. Learning Agent switches to a railway route example
7. Activity Agent generates easier weighted-graph questions
8. Student improves → system **increases difficulty**
9. Student completes all required DSA topics and takes the final assessment
10. Student reaches **85% mastery** → certificate generated
11. Certificate receives a blockchain-backed proof
12. A judge verifies it on the **public verification page**

**Success looks like:** a judge clearly sees *Initial knowledge → Behaviour → Learner model → AI decision → Personalized learning → Improved performance → Mastery → Certificate → Verification*, with measurable adaptation rather than just a chatbot.

---

## 🗺 Roadmap

After the MVP: advanced learner modelling · embeddings & vector search · ML recommendations · contextual bandits · more subjects · teacher dashboards · institutional analytics · mobile apps · collaborative learning · advanced certification · more sophisticated blockchain verification

---

## 🧭 Core Principles

- Learning effectiveness **>** AI complexity
- Real personalization **>** AI buzzwords
- Working MVP **>** Feature quantity
- Evidence of mastery **>** Course completion
- Student privacy **>** Data collection
- Useful blockchain verification **>** Blockchain for its own sake

---


