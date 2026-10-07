DecentralLearn

An AI-Powered Adaptive Academic Learning Platform

DecentralLearn is an adaptive learning platform designed to personalize technical education based on a learner's knowledge, interests, preferences, and performance.

The platform follows the principle:

“Don't make the learner fit the system. Make the system fit the learner.”

It currently focuses on Data Structures & Algorithms (DSA) for undergraduate learners and combines rule-based personalization with Google Gemini to provide adaptive learning experiences.

🚀 Key Features
🔐 Authentication
User signup and login
Supabase Authentication
Protected application routes
Secure session handling
🎯 Personalized Onboarding

Learners provide:

Academic level
Subject
DSA topics
Current knowledge level
Learning goals
Preferred explanation style
Personal interests
Preferred practice difficulty
📝 Diagnostic Assessment

The platform evaluates the learner's initial DSA knowledge through predefined questions.

It identifies:

Strong topics
Topics requiring practice
Initial performance
Starting difficulty
📚 Adaptive Learning Content

Learners can study DSA topics through:

Structured explanations
Examples
Key concepts
Complexity information
Topic progress
C++ implementations
Java implementations

C++ is the default programming language, with Java available as an alternative.

🤖 AI-Powered Personalized Learning

DecentralLearn integrates Google Gemini through a secure backend service.

The AI can personalize explanations using:

Learner level
Current topic
Learning preferences
Interests
Recent performance
Current difficulty

AI-generated explanations can include:

Personalized introduction
Concept overview
Real-world analogy
Step-by-step explanation
C++/Java examples
Common mistakes
Adaptive learning tips

The API key is kept on the backend and is never exposed to the frontend.

🧠 Rule-Based Adaptation

The platform does not depend entirely on AI.

It also uses deterministic adaptation rules:

Learner behavior	Adaptation
Low accuracy	Easier questions + revision
Repeated mistakes	Identify concept gap + revision
Slow completion	Step-by-step explanation
High performance	Increase difficulty
Strong interest	Use relevant examples

This allows the system to demonstrate the complete adaptive-learning cycle.

🧪 Adaptive Practice

Practice sessions:

Select questions based on topic and difficulty
Track answers
Track attempts
Track hints
Track time
Evaluate correctness
Adapt subsequent difficulty
Avoid repeating questions within a session
📊 Progress Tracking

The platform tracks:

Overall progress
Topic progress
Topic mastery
Accuracy
Practice performance
Strong areas
Areas requiring practice
Recent activity
Recommended topics
🏆 Mastery System

Completion alone does not indicate mastery.

The MVP mastery model considers:

Topic performance
Practice performance
Concept understanding
Problem-solving
Final assessment

The target certification condition is:

Overall Mastery >= 80%
AND
Final Assessment >= 75%
AND
Required Topics Completed

If mastery is not achieved:

More Practice
      ↓
Revision
      ↓
Reassessment
📜 Certification

After demonstrating mastery, the platform can generate a certificate containing:

Student name
Subject
Achievement
Mastery score
Completion date
Certificate ID
Platform name
Verification mechanism
⛓️ Blockchain Verification

Blockchain is used only for certificate authenticity.

Sensitive learner information remains in Supabase.

The blockchain layer is intended to store:

Certificate hash/proof
Certificate ID
Timestamp
Verification reference

A public verification page can allow anyone to verify a certificate using its certificate ID.

🏗️ System Architecture
                    ┌──────────────────────┐
                    │       Learner        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │ TypeScript + Tailwind│
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
       ┌────────────────┐           ┌──────────────────┐
       │    Supabase    │           │ Node.js / Express│
       │ Auth + Database │           │     Backend      │
       └────────────────┘           └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │   AI Service     │
                                    │ Rule-based + LLM │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │   Google Gemini  │
                                    └──────────────────┘
🛠️ Technology Stack
Frontend
React
TypeScript
Tailwind CSS
React Router
Recharts
Lucide React
Backend
Node.js
Express.js
Database & Authentication
Supabase
PostgreSQL
Supabase Authentication
Row Level Security (RLS)
AI
Google Gemini API
Rule-based personalization
AI orchestration
Blockchain
Blockchain network/testnet
Used only for certificate verification
Development
Antigravity
📁 Project Structure
DecentralLearn/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── .env
│   └── package.json
│
├── server/
│   ├── routes/
│   │   └── aiRoutes.js
│   ├── services/
│   │   └── aiService.js
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
⚙️ Environment Variables
Frontend

Create:

client/.env

Example:

VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
Backend

Create:

server/.env

Example:

PORT=5000
NODE_ENV=development

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

AI_API_KEY=YOUR_GEMINI_API_KEY
AI_API_URL=https://generativelanguage.googleapis.com/v1beta

CLIENT_URL=http://localhost:5173

Never commit .env files or expose the Gemini API key in frontend code.

▶️ Running the Project
1. Install dependencies

Frontend:

cd client
npm install

Backend:

cd server
npm install
2. Start the backend
cd server
npm run dev

Backend:

http://localhost:5000
3. Start the frontend

In another terminal:

cd client
npm run dev

Frontend:

http://localhost:5173
🔄 Adaptive Learning Flow

DecentralLearn follows the core loop:

Observe
   ↓
Understand
   ↓
Decide
   ↓
Adapt
   ↓
Evaluate
   ↓
Update Learner Model
   ↓
Adapt Again
Example
Student
   ↓
Diagnostic Assessment
   ↓
Initial Knowledge
   ↓
Learner Model
   ↓
AI / Rule-Based Decision
   ↓
Personalized Learning
   ↓
Practice
   ↓
Performance Analysis
   ↓
Difficulty Adaptation
   ↓
Improved Performance
   ↓
Mastery
   ↓
Certificate
   ↓
Verification
🔌 Important API Endpoints
AI
GET /api/ai/status

Checks the AI service status.

POST /api/ai/explain

Generates a personalized explanation.

Health
GET /health

Checks backend availability.

Additional application APIs can include:

POST /auth/signup
POST /auth/login

GET /subjects
GET /subjects/:id/topics

POST /assessment/start
POST /assessment/submit

GET /learner/profile
GET /learner/progress

POST /activity/generate
POST /activity/submit

GET /recommendations

POST /certificates/generate
GET /certificates/:certificateId

GET /verify/:certificateId

Only APIs required by the MVP should be implemented.

🔒 Security

DecentralLearn follows these security principles:

Supabase Authentication
Row Level Security
Protected backend endpoints
Server-side API keys
No Gemini API key in frontend code
Minimal personal data collection
Authorized access to learner information
Sensitive learner data is not stored on-chain
🎓 Target Learners

The MVP primarily targets:

Undergraduate technical students

The recommended demonstration subject is:

Data Structures & Algorithms

🧩 DSA Topics

The platform supports topics such as:

Arrays
Strings
Linked Lists
Stack & Queue
Trees
Graphs
Sorting
Searching
💡 Example Personalization

Suppose a learner selects:

Interest: Railway & Transit Networks
Topic: Graphs
Current Level: Intermediate
Explanation Style: Real-world

The platform can explain graph concepts using railway-network examples.

If the learner repeatedly struggles with weighted graphs:

Repeated Mistakes
       ↓
Concept Gap Detected
       ↓
Revision
       ↓
Easier Weighted Graph Problem
       ↓
Improved Performance
       ↓
Difficulty Increased

This demonstrates that the platform adapts to the learner instead of forcing every learner through the same path.

🏆 Hackathon Demo Flow

The recommended demonstration flow is:

1. Student Signup/Login
        ↓
2. Select Undergraduate + DSA
        ↓
3. Select Topics
        ↓
4. Select Learning Preferences & Interest
        ↓
5. Complete Diagnostic Assessment
        ↓
6. Learner Model Created
        ↓
7. Personalized Dashboard
        ↓
8. Learn a DSA Topic
        ↓
9. AI Personalized Explanation
        ↓
10. Adaptive Practice
        ↓
11. Mistake / Behavior Detected
        ↓
12. Difficulty & Learning Path Adapt
        ↓
13. Progress Improves
        ↓
14. Mastery Achieved
        ↓
15. Certificate Generated
        ↓
16. Certificate Verified

The strongest part of the demonstration should show:

Before adaptation → Adaptation → After adaptation

rather than simply demonstrating AI-generated content.

🚧 Current Development Status
Completed
Authentication
Signup/Login
Onboarding
DSA topic selection
Learning preferences
Interests
Diagnostic assessment
Personalized dashboard
Learning content
C++ / Java learning code
Adaptive practice
Rule-based difficulty adaptation
Secure backend AI architecture
Google Gemini integration architecture
AI personalized explanations
In Progress / Upcoming
Progress & mastery system
Final assessment/reassessment
Certificate generation
Public certificate verification
Blockchain certificate authenticity
Final end-to-end testing and deployment
🔮 Future Enhancements

Possible future features include:

Advanced machine learning personalization
Embeddings
Voice-based learning
Gamification
Teacher dashboards
Additional academic subjects
More programming languages
Advanced analytics

These are outside the core MVP scope.

🎯 Project Vision

DecentralLearn aims to transform traditional one-size-fits-all education into an adaptive learning experience where the system continuously understands the learner and changes the learning experience accordingly.

Observe → Understand → Adapt → Learn → Evaluate → Improve

DecentralLearn — Learning that adapts to you.
