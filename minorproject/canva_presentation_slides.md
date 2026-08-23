# 🎨 Canva Presentation Theme & Design Guidelines

### Visual Theme & Color Palette
* **Primary Accent (Deep Himalayan Indigo):** `#1E293B` or `#0F172A` (Professional engineering & academic base)
* **Brand / Highlight (Nepal Rhododendron Red & Emerald):** `#DC2626` & `#059669` (For callouts, metrics, and key headings)
* **Secondary Gradient (Tech Blue):** `#2563EB` to `#0EA5E9` (For AI / LangGraph nodes and flow arrows)
* **Background:** Clean White `#FFFFFF` / Soft Off-White `#F8FAFC`
* **Typography:**
  * **Headings:** *Inter*, *Montserrat*, or *Outfit* (Bold, 28–36pt)
  * **Body Text:** *Inter* or *Roboto* (Regular/Medium, 14–18pt)
  * **Code / Metrics:** *JetBrains Mono* or *Fira Code*

---

# 🤖 Canva Magic Design AI Prompt
*(Copy and paste the text below into Canva AI / Magic Design)*

```text
Create an 18-slide clean, modern, and academic engineering presentation on "TravelNepal: An Intelligent Multi-Agent Tourism & Workspace Platform with Context-Aware Transcription Correction & Digital Payments" for Tribhuvan University, Institute of Engineering (IOE), Purwanchal Campus. 

Theme: Professional engineering presentation, clean white background, dark slate text, subtle tech blue and emerald accents, high readability with clear tables, flowcharts, and bullet points.

The presentation must include these 18 slides in order:
1. Title Slide (Tribhuvan University, IOE Purwanchal Campus, Minor Project, Student Names, Supervisor)
2. Introduction (Nepal tourism fragmentation, limitations of generic chatbots, TravelNepal solution)
3. Problem Statement (Speech-to-Text errors, hallucinated transit fares, lack of HITL action cards, isolated partner tools)
4. Objectives (Context-aware STT correction, LangGraph multi-agent orchestration, HITL Cloudinary mutations, multi-role workspaces)
5. Literature Review (Comparison table of Keyword Search, LLMs, RAG, CRAG, Multi-Agent Systems, and Research Gap)
6. System Block Diagram (3-Tier architecture: Next.js Frontend, STT Correction Layer, LangGraph Multi-Agent Backend, PostgreSQL & Cloudinary)
7. Use Case Diagram (Actors: Tourist, Hotel Owner, Restaurant Owner, Tour Guide, Admin with actions)
8. Architecture & Workflow (Step-by-step query flow: STT Refinement -> Supervisor Intent Routing -> DB/Web RAG -> Response Synthesis & HITL)
9. Data and Tools (Next.js 16, TypeScript, FastAPI, Python, LangGraph, Gemini 3.6 Flash, PostgreSQL Drizzle, Cloudinary, Khalti)
10. Implementation Details (Transcription Refiner Service, LangGraph StateGraph, Live Workspace Notification Engine, Cloudinary uploader)
11. Sample Output 1 - Landing Page & Module Explorer
12. Sample Output 2 - Conversational Voice Assistant & Transit Route Planning
13. Sample Output 3 - Partner HITL Mutation & Cloudinary Photo Upload
14. Performance Evaluation (Table with STT Accuracy 94.6%, Routing Precision 96.2%, Groundedness 95.8%, Latency 1.1s-2.2s)
15. Results and Conclusion (Key achievements, reduction in hallucination, actionable partner workflows)
16. Future Works and Limitations (Gemini Live WebSockets, IoT Guide tracking, dependency on LLM API)
17. Any Queries? (Q&A discussion slide)
18. Thank You (Namaste & closing credits)
```

---

# 📄 Full Canva Importable Slide Content (Markdown)
*(Use this with "Canva Docs ➔ Convert to Presentation" or Gamma.app)*

# Slide 1: Title
### Tribhuvan University | Institute of Engineering | Purwanchal Campus
# TRAVELNEPAL: An Intelligent Multi-Agent Tourism & Workspace Platform
### With Context-Aware Speech-to-Text Transcription Correction & Digital Payments
* **Minor Project Presentation**
* **Department of Electronics & Computer Engineering**
* **Supervisor:** Asst. Prof. Bikram Shah

---

# Slide 2: Introduction
### Revolutionizing Nepal's Tourism with Intelligent Multi-Agent Systems
* **Fragmented Information:** Nepal's travel information, hotel bookings, transit routes, and guide listings are scattered across unverified platforms.
* **Limitations of Standard AI:** Generic chatbots hallucinate bus routes, lack localized NPR pricing, fail on Nepali phonetic voice errors, and cannot execute database transactions.
* **Our Solution:** **TravelNepal** — A unified ecosystem pairing context-aware voice transcription refinement with specialized LangGraph AI sub-agents and real-time enterprise workspaces.

---

# Slide 3: Problem Statement
### Critical Gaps in Contemporary Tourism Systems
* **Speech-to-Text Phonetic Distortions:** Voice assistants frequently distort Nepalese place names (e.g. *"Pokhra for tree days"* or *"Muktinathh"*), causing routing failures.
* **Lack of Grounded Local Verification:** Standard LLMs cannot compute government student discounts (45% bus fare concessions) or verified hotel availability.
* **Absence of Actionable Mutations:** Traditional chatbots can only generate static text; they cannot publish hotel rooms or upload photos.
* **Disjointed Partner Operations:** Hotel and restaurant owners lack integrated AI tools to manage inventory directly from natural language.

---

# Slide 4: Objectives
### Core Goals of the Project
* **Context-Aware Speech Correction Layer:** Build a dedicated LLM filter to sanitize phonetic STT typos and code-mixed Nepali queries before agent processing.
* **Hierarchical Multi-Agent Orchestration:** Implement a LangGraph supervisor delegating queries across specialized sub-agents (Itinerary, Hotel, Dining, Transit, RBAC).
* **Human-In-The-Loop (HITL) Action Engine:** Enable conversational database mutations (room publishing with Cloudinary drag-and-drop, Khalti digital checkout).
* **Real-Time Enterprise Workspaces:** Build live PostgreSQL notification and audit dashboards for Hotel Owners, Restaurant Owners, Tour Guides, and Admins.

---

# Slide 5: Literature Review
### Evolution of Information Retrieval & Multi-Agent Systems

| Approach | Key Technique | Strengths | Limitations | Relevance to Our Work |
| :--- | :--- | :--- | :--- | :--- |
| **Rule-Based Portals** | Keyword Matching | Fast, deterministic | Rigid; fails on natural phrasing | Shows need for flexible NLU |
| **Vanilla LLMs** | Transformer Deep Learning | Fluent natural language | Factual hallucinations, no actions | Base conversational interface |
| **Standard RAG** | Vector Embeddings | Grounded document retrieval | Static; cannot execute mutations | Basis for catalog search |
| **LangGraph Multi-Agent** | StateGraph Delegation | Domain division & shared state | Complex state management | Core architecture of TravelNepal |
| **Contextual STT Refiner** | LLM Phonetic Correction | Corrects spelling with context | Requires low-latency design | Dedicated pre-agent layer |

---

# Slide 6: System Block Diagram
### 3-Tier Multi-Agent System Architecture
* **Frontend Tier:** Next.js 16 (App Router), TypeScript, TailwindCSS, Khalti Checkout.
* **Sanitization Tier:** Context-Aware LLM Transcription Refiner (Sanitizes STT errors).
* **Intelligence Tier (FastAPI):** LangGraph StateGraph Supervisor routing to Hotel, Dining, Transit, Itinerary, and RBAC Sub-Agents.
* **Data & Storage Tier:** PostgreSQL (Drizzle/SQLAlchemy ORM), Cloudinary Media Storage, DuckDuckGo Live Grounding.

---

# Slide 7: Use Case Diagram
### Platform Actors & Functional Interactions
* **Tourist / Traveler:** Plans custom multi-day trips, books verified hotel rooms with Khalti, calculates 45% student bus discounts, logs travel expenses.
* **Hotel Owner:** Manages rooms, receives live booking notifications, uploads photos via AI HITL action cards.
* **Restaurant Owner:** Publishes authentic dishes, edits digital menus, tracks orders.
* **Tour Guide:** Lists licensed Himalayan trekking packages and availability.
* **Super Admin:** Audits partner onboarding, verifies business licenses, monitors platform activity.

---

# Slide 8: Architecture & Workflow
### End-to-End Execution Pipeline
1. **Voice / Text Query:** Traveler inputs query via voice or text.
2. **LLM Transcription Refinement:** Analyzes full sentence context (*"Pokhra for tree days"* $\rightarrow$ *"Pokhara for three days"*).
3. **Supervisor Intent Routing:** Classifies intent and delegates to domain sub-agents.
4. **Hybrid RAG Retrieval:** Queries local PostgreSQL database first; triggers live DuckDuckGo web search if missing.
5. **Synthesis & Action:** Synthesizes structured markdown plan, Google Maps cards, or returns an interactive HITL confirmation card.

---

# Slide 9: Data and Tools
### Comprehensive Technology Stack
* **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS, Framer Motion, Lucide Icons.
* **Backend:** FastAPI (Python 3.13), Uvicorn, LangGraph, LangChain Core, Pydantic v2.
* **AI & NLU:** Google Gemini 3.6 Flash, Google GenAI SDK.
* **Databases:** PostgreSQL (Neon Serverless), Drizzle ORM, SQLAlchemy.
* **APIs & Storage:** Cloudinary Media API, Khalti Payment Gateway, Google Maps URL Engine, DuckDuckGo Search.

---

# Slide 10: Implementation Details
### Engineering Highlights
* **Non-Blocking STT Service:** Dedicated `transcription_correction_service.py` with fast-path greeting bypass and graceful fallback guarantees.
* **LangGraph Supervisor:** Stateful directed graph with custom checkpointing, slot filling, and anti-injection guardrails.
* **Real-Time Notification Engine:** Server actions dynamically polling PostgreSQL tables for live workspace alerts.
* **Cloudinary Direct Upload:** Interactive action cards allowing direct image drag-and-drop within the AI chat window.

---

# Slide 11: Sample Output – Platform Interface
### Modern Landing Page & Interactive Module Explorer
* Comprehensive Hero Section with instant Voice Guide.
* Live search and filter for Top Nepal Destinations.
* Modular quick-access cards for Stays, Food, Transit, and Himalayan Guides.

---

# Slide 12: Sample Output – Conversational AI Assistant
### Personalized Itineraries & Transit Routing
* Multi-day trip generator (e.g. *"3-day Pokhara trip under NPR 20,000"*).
* Transit calculation with 45% student discount and highway rest stops.
* Interactive Google Maps navigation cards rendered directly in chat.

---

# Slide 13: Sample Output – Partner HITL Mutation
### Conversational Room Creation & Image Upload
* Role-based access control protecting partner actions.
* Conversational parameter extraction (Room type, price per night, capacity).
* Embedded Cloudinary uploader with **Confirm & Execute** safety button.

---

# Slide 14: Performance Evaluation
### Quantitative System Benchmarks

| Metric | Score | Evaluation Criteria |
| :--- | :---: | :--- |
| **STT Correction Accuracy** | **94.6%** | Correcting phonetic destination names and durations without altering intent |
| **Supervisor Routing Precision** | **96.2%** | Correct delegation to specialized sub-agents |
| **Groundedness Score** | **95.8%** | Factual alignment with database catalog and live web search results |
| **End-to-End Latency** | **1.1s – 2.2s** | Turnaround time from query submission to complete synthesized response |

---

# Slide 15: Results and Conclusion
### Key Accomplishments & Impact
* **Eliminated Speech Recognition Errors:** Successfully corrected phonetically ambiguous Nepalese destinations and durations.
* **Actionable Conversational AI:** Enabled hotel and restaurant owners to manage catalog items conversationally.
* **Transparent Grounded Pricing:** Provided real NPR rates, verified database stays, and official transit concessions.
* **Conclusion:** TravelNepal bridges the gap between conversational AI intelligence and enterprise tourism operations across Nepal.

---

# Slide 16: Future Works and Limitations
### Road Ahead & Engineering Scope
* **Future Works:**
  * Bidirectional real-time voice streaming with Gemini Live WebSockets.
  * GPS tracking and IoT SOS beacon integration for mountain guides.
  * Automated OCR scanning for student card verification during bus checkout.
* **Limitations:**
  * Requires active internet connectivity for Gemini LLM calls and Khalti payments.
  * Live web search adds ~500ms latency on queries with zero database matches.

---

# Slide 17: Any Queries?
# Questions & Discussion
### We are open to your questions and valuable feedback.

---

# Slide 18: Thank You!
# Thank You!
### धन्यवाद | Namaste 🙏
**TravelNepal Minor Project Team**  
*Tribhuvan University, Institute of Engineering (IOE)*
