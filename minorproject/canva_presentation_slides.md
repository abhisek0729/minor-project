# 🎓 TravelNepal Minor Project Presentation (Academic Black & White / Minimalist Engineering Theme)

---

## 🎨 Exact Visual Theme & Design Tokens (Reference Matching)

| Element | Specification & Hex Code | Usage in Slides |
| :--- | :--- | :--- |
| **Canvas Background** | Pure Crisp Off-White `#F8F9FA` / `#FFFFFF` | All content slides (1–16) |
| **Dark Heading Text** | Deep Slate Black `#0F172A` / `#111827` | Main slide titles & leading bold thoughts |
| **Category Kicker / Tag** | Slate Cyan / Teal `#0D9488` (Bold, Uppercase, Tracking +0.15em) | Section labels above title (`INTRODUCTION`, `PROBLEM STATEMENT`, etc.) |
| **Accent / Divider** | Emerald Green `#059669` (2px horizontal rule) | Header underline & primary emphasis bars |
| **Secondary Accent** | Deep Navy / Slate Blue `#1E3A8A` / `#0F2942` | Step cards, secondary comparison bars, and badges |
| **Card Container Background**| Light Slate Gray `#F1F5F9` / Soft Emerald Tint `#F0FDF4` | Problem cards, block diagrams, metric boxes |
| **Closing Dark Background** | Atmospheric Himalayan Night Navy `#0B192C` / `#0F172A` | Q&A (Slide 17) and Thank You (Slide 18) |
| **Typography** | **Headings:** *Inter* / *Plus Jakarta Sans* (ExtraBold 700/800)<br>**Body:** *Inter* (Regular/Medium 400/500)<br>**Metrics & Monospace:** *JetBrains Mono* | Clean, academic, and highly readable |

---

## 🤖 Canva Magic Design & Gamma.app Master Prompt
*(Copy-paste this exact prompt into Canva AI, Gamma.app, or NotebookLM to auto-generate the identical 18 slides)*

```text
Create an 18-slide academic, minimalist, and professional engineering presentation on "TravelNepal: An Intelligent Multi-Agent Tourism & Workspace Platform with Context-Aware Speech-to-Text Transcription Correction & Digital Payments" for Tribhuvan University, Institute of Engineering (IOE), Purwanchal Campus.

Design Style:
- Aesthetic: Clean Black & White academic minimalism with crisp slate black headings (#0F172A), pure off-white background (#F8F9FA), and subtle emerald green (#059669) and navy (#1E3A8A) structural accents.
- Layout: Strong typographic hierarchy, uppercase green kicker sub-headers, clean structured 4-column cards, sequential workflow pipelines (Voice -> Refine -> Route -> Ground -> Respond), comparison matrix tables (Keyword Search, LLMs, RAG, CRAG, Multi-Agent), quantitative metric bars, and laptop mockup callouts.
- Footers: Every content slide must have the bottom bar: "TRAVELNEPAL • IOE PURWANCHAL CAMPUS" with the slide number.

Generate the exact 18 slides in the following structure:
Slide 1: Title Slide (Tribhuvan University | IOE Purwanchal Campus, TravelNepal, Supervisor Asst. Prof. Bikram Shah)
Slide 2: Introduction (One journey. Too many disconnected systems. Unifying fragmented Nepal tourism)
Slide 3: Problem Statement (Small input errors create real operational failures: Phonetic Noise, No Grounding, Fare Logic Gap, No Action Layer)
Slide 4: Objectives (Four engineering objectives: STT refinement, LangGraph supervisor, HITL mutations, Role-specific workspaces)
Slide 5: Literature Review (From retrieval to grounded orchestration: Matrix comparing Keyword Search, LLMs, RAG, CRAG, Multi-Agent + Research Gap)
Slide 6: System Block Diagram (Layered, observable, transaction-ready: Frontend, STT Correction, Backend & Agents, Data & Grounding)
Slide 7: Use Case Diagram (Five roles. One governed platform: Tourist, Hotel Owner, Restaurant Owner, Tour Guide, Admin)
Slide 8: Architecture & Workflow (A query becomes a verified action: Voice/Text -> Refine -> Route -> Ground -> Respond)
Slide 9: Technology Stack (Frontend: Next.js 16/Tailwind, Backend: FastAPI/LangGraph, AI: Google Gemini, Data: PostgreSQL/Cloudinary/Khalti)
Slide 10: Implementation Details (Core services engineered for safe execution: Transcription Refiner, LangGraph StateGraph, Notification Engine, Cloudinary Uploader)
Slide 11: Sample Output 01 (Landing page & module explorer - Public experience designed around immediate intent)
Slide 12: Sample Output 02 (Voice assistant & transit planning - "3-day Pokhara trip under NPR 20,000" with 45% student discount & Google Maps)
Slide 13: Sample Output 03 (Partner HITL mutation & photo upload - Safe actions stay human-approved with Cloudinary)
Slide 14: Performance Evaluation (Reliable by design, responsive in practice: STT Accuracy 94.6%, Routing 96.2%, Groundedness 95.8%, Latency 1.1-2.2s)
Slide 15: Results and Conclusion (Conversational intelligence meets tourism operations: TRAVELNEPAL = ASSIST + VERIFY + ACT)
Slide 16: Future Works & Limitations (Roadmap and current constraints: Gemini Live WebSockets & IoT beacons vs Internet connectivity requirements)
Slide 17: Questions & Discussion (Any queries? We are open to your questions and valuable feedback)
Slide 18: Thank You! (धन्यवाद | Namaste - TravelNepal Minor Project Team, IOE Purwanchal Campus)
```

---

## 📄 Complete 1:1 Verbatim Slide Content

```markdown
<!-- slide -->
# Slide 1: Title Slide
**Kicker:** TRIBHUVAN UNIVERSITY | INSTITUTE OF ENGINEERING • PURWANCHAL CAMPUS  
**Department:** MINOR PROJECT • DEPARTMENT OF ELECTRONICS & COMPUTER ENGINEERING  

# TravelNepal
## An Intelligent Multi-Agent Tourism & Workspace Platform
### With Context-Aware Speech-to-Text Transcription Correction & Digital Payments

* **Supervisor:** Asst. Prof. Bikram Shah  
* **Student Names:** TravelNepal Minor Project Team  
* **Badge:** नेपाल • AI • TOURISM • VOICE • PAYMENTS  

---

<!-- slide -->
# Slide 2: Introduction
**Kicker:** INTRODUCTION  
# One journey. Too many disconnected systems.
### TravelNepal unifies fragmented tourism services into one intelligent, transaction-ready platform.

* Travel information, hotel bookings, transit routes, and local guides remain scattered across disconnected portals.
* Generic chatbots hallucinate routes, misread Nepali phonetics, lack local NPR pricing, and stop before real actions.
* **Core Solution:** `VOICE ASSISTANCE → SPECIALIZED AGENTS → VERIFIED SERVICES`

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 02*

---

<!-- slide -->
# Slide 3: Problem Statement
**Kicker:** PROBLEM STATEMENT  
# Small input errors create real operational failures.

| PHONETIC NOISE | NO GROUNDING | FARE LOGIC GAP | NO ACTION LAYER |
| :--- | :--- | :--- | :--- |
| **"Pokhra for tree days" / "Muktinathh"** | **Availability cannot be verified** | **45% student concession omitted** | **Static chat response only** |
| Wrong destination or duration parsed by AI | Unreliable hotel recommendations & hallucinations | Incorrect transit budget calculation | Rooms and photos stay unpublished in DB |

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 03*

---

<!-- slide -->
# Slide 4: Objectives
**Kicker:** OBJECTIVES  
# Four engineering objectives

* **01** Correct phonetic typos and code-mixed Nepali queries with context-aware STT refinement.
* **02** Coordinate Itinerary, Hotel, Dining, Transit, and RBAC agents through a LangGraph supervisor.
* **03** Execute safe HITL mutations: room publishing, photo upload, and Khalti checkout.
* **04** Provide role-specific workspaces for Hotel Owners, Restaurant Owners, Tour Guides, and Admins.

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 04*

---

<!-- slide -->
# Slide 5: Literature Review
**Kicker:** LITERATURE REVIEW  
# From retrieval to grounded orchestration

| APPROACH | GROUNDING | NL FLEXIBILITY | CORRECTION | ACTIONS | ORCHESTRATION |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Keyword Search** | Low | Low | — | — | — |
| **LLMs** | Low | High | Low | — | — |
| **RAG** | High | High | — | — | — |
| **CRAG** | High | High | High | — | — |
| **Multi-Agent** | Varies | High | Varies | High | High |

> **RESEARCH GAP:** Context-aware correction + grounded multi-agent mutations for Nepal tourism.

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 05*

---

<!-- slide -->
# Slide 6: System Block Diagram
**Kicker:** SYSTEM BLOCK DIAGRAM  
# Layered, observable, transaction-ready

* **FRONTEND:** Next.js 16 • TypeScript • TailwindCSS • Khalti Wallet
* **STT CORRECTION:** Context-aware LLM refiner • Voice input sanitization
* **BACKEND & AGENTS:** FastAPI • LangGraph • Supervisor + Sub-agents
* **DATA & GROUNDING:** PostgreSQL • Cloudinary • DuckDuckGo Web Search • ORM

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 06*

---

<!-- slide -->
# Slide 7: Use Case Diagram
**Kicker:** USE CASE DIAGRAM  
# Five roles. One governed platform.

* **Core Platform:** TRAVELNEPAL PLATFORM (Central Hub)
  * **Tourist:** Plan • Book • Transit • Expenses
  * **Hotel Owner:** Listings • Rooms • Availability
  * **Restaurant Owner:** Menus • Availability • Dishes
  * **Tour Guide:** Packages • Schedules • Profile
  * **Admin:** Verify • Audit • Monitor

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 07*

---

<!-- slide -->
# Slide 8: Architecture & Workflow
**Kicker:** ARCHITECTURE & WORKFLOW  
# A query becomes a verified action

```text
[ VOICE / TEXT ] ➔ [ REFINE ] ➔ [ ROUTE ] ➔ [ GROUND ] ➔ [ RESPOND ]
   User query        Pokhra➔Pokhara   Supervisor selects   Database first;      Plan, map, or
                     tree➔three       specialist agent     web fallback         HITL action card
```

> **Core Principle:** *Database retrieval precedes live search — reducing hallucination while preserving coverage.*

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 08*

---

<!-- slide -->
# Slide 9: Technology Stack
**Kicker:** DATA AND TOOLS  
# Technology stack

* **FRONTEND:** Next.js 16 • React 19 • TypeScript • TailwindCSS • Framer Motion • Lucide
* **BACKEND:** FastAPI • Python 3.13 • Uvicorn • LangGraph • LangChain Core • Pydantic v2
* **AI & MODELS:** Google Gemini Flash Models • Google GenAI SDK
* **DATA & SERVICES:** PostgreSQL • Drizzle ORM • SQLAlchemy • Cloudinary • Khalti • Google Maps • DuckDuckGo

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 09*

---

<!-- slide -->
# Slide 10: Implementation Details
**Kicker:** IMPLEMENTATION DETAILS  
# Core services engineered for safe execution

* **TRANSCRIPTION REFINER:** Fast-path greeting bypass; context correction; graceful fallback guarantees.
* **LANGGRAPH STATEGRAPH:** Checkpointing, slot filling, stateful routing, and anti-injection guardrails.
* **NOTIFICATION ENGINE:** PostgreSQL-driven live alerts for partner workspace operations.
* **CLOUDINARY UPLOADER:** Direct image upload through conversational action cards.

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 10*

---

<!-- slide -->
# Slide 11: Sample Output 01
**Kicker:** SAMPLE OUTPUT 01  
# Landing page & module explorer
### Public experience designed around immediate intent.

* **VOICE GUIDE:** Instant conversational entry point with Speech-to-Text.
* **DISCOVERY:** Search and filter Nepal destinations with live ratings and costs.
* **MODULES:** Curated Stays • Authentic Food • Intercity Transit • Certified Himalayan Guides.

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 11*

---

<!-- slide -->
# Slide 12: Sample Output 02
**Kicker:** SAMPLE OUTPUT 02  
# Voice assistant & transit planning
### “3-day Pokhara trip under NPR 20,000”

* Routes, rest stops, highway numbers (H01/H02), and 45% government student bus concessions are computed.
* Interactive Google Maps direction cards and itemized NPR budgets appear directly inside the conversation.

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 12*

---

<!-- slide -->
# Slide 13: Sample Output 03
**Kicker:** SAMPLE OUTPUT 03  
# Partner HITL mutation & photo upload
### Safe actions stay human-approved.

* **RBAC Protected:** Strict role-based verification prevents unauthorized mutations.
* **Conversational Extraction:** Captures room type, nightly rate, and guest capacity from natural language.
* **Cloudinary Direct Upload:** Interactive drag-and-drop photo uploader inside the chat.
* **`CONFIRM → EXECUTE`** paradigm guarantees zero unapproved database commits.

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 13*

---

<!-- slide -->
# Slide 14: Performance Evaluation
**Kicker:** PERFORMANCE EVALUATION  
# Reliable by design, responsive in practice

* **STT Correction Accuracy:** `94.6%` [██████████████████░░]
* **Supervisor Routing Precision:** `96.2%` [███████████████████░]
* **Groundedness Score:** `95.8%` [███████████████████░]
* **End-to-End Latency:** `1.1 – 2.2s`

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 14*

---

<!-- slide -->
# Slide 15: Results and Conclusion
**Kicker:** RESULTS AND CONCLUSION  
# Conversational intelligence meets tourism operations

* **01** Corrected phonetically ambiguous Nepalese destinations and travel durations.
* **02** Reduced hallucination through database grounding and live-search fallback.
* **03** Enabled conversational catalog management for hotel and restaurant owners.
* **04** Connected customer assistance with governed enterprise tourism workflows.

### **TRAVELNEPAL = ASSIST + VERIFY + ACT**

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 15*

---

<!-- slide -->
# Slide 16: Future Works & Limitations
**Kicker:** FUTURE WORKS & LIMITATIONS  
# Roadmap and current constraints

| FUTURE ROADMAP | CURRENT LIMITATIONS |
| :--- | :--- |
| **Gemini Live WebSockets** for bidirectional real-time voice streaming. | **Cloud Connectivity:** Gemini LLM calls and Khalti payments require active internet. |
| **GPS Tracking & IoT SOS Beacons** for high-altitude trekking safety. | **Search Latency:** Live web search fallback adds ~500ms when database matches are 0. |
| **OCR Student Card Verification** for automated transit concession validation. | |

*Footer: TRAVELNEPAL • IOE PURWANCHAL CAMPUS | 16*

---

<!-- slide -->
# Slide 17: Questions & Discussion
*(Dark Himalayan Slate Background: #0B192C)*

# Any queries?
### We are open to your questions and valuable feedback.

---

<!-- slide -->
# Slide 18: Closing & Acknowledgements
*(Dark Himalayan Slate Background: #0B192C)*

# Thank You!
## धन्यवाद | Namaste

### **TravelNepal Minor Project Team**
Tribhuvan University, Institute of Engineering (IOE)  
Purwanchal Campus, Dharan, Nepal
```
