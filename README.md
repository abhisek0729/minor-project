# 🏔️ TravelNepal (TourSphere) - AI-Powered Unified Tourism Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20%26%20SQLAlchemy-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-LangGraph%20Agents-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 Executive Overview

**TravelNepal** is an end-to-end, AI-powered unified tourism management and itinerary intelligence ecosystem tailored for Nepal's travel landscape. It solves the critical challenges of tourism fragmentation by interconnecting **travelers**, **hotel owners**, **restaurant operators**, **certified trekking guides**, and **platform administrators** into a single cohesive platform with integrated payments, smart itinerary generation, and real-time emergency protocols.

---

## 🏗️ Architecture & Technology Stack

```text
                               ┌──────────────────────────────────────────┐
                               │       Client Browsers & Mobile Devices   │
                               └────────────────────┬─────────────────────┘
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   ▼                                                                 ▼
   ┌───────────────────────────────┐                                 ┌───────────────────────────────┐
   │    Next.js 16 (Frontend)      │                                 │     FastAPI (AI & APIs)       │
   │  - App Router / React 19      │   REST / JSON + Bearer JWT      │  - Python 3.11+ / Uvicorn     │
   │  - Drizzle ORM (PostgreSQL)   │ ◄─────────────────────────────► │  - SQLAlchemy Async           │
   │  - NextAuth (Google & Email)  │                                 │  - LangGraph + Gemini AI      │
   │  - Tailwind CSS v4 / Shadcn   │                                 │  - Alembic Migrations         │
   │  - Khalti & eSewa Gateways    │                                 │  - Expense Insight Engines    │
   └───────────────┬───────────────┘                                 └───────────────┬───────────────┘
                   │                                                                 │
                   └────────────────────────────────┬────────────────────────────────┘
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │        PostgreSQL Database (Neon)        │
                               └──────────────────────────────────────────┘
```

### 💻 Frontend Tech Stack
* **Framework**: Next.js 16 (Turbopack, React 19, Server Actions)
* **Styling**: Tailwind CSS v4, Framer Motion, Radix UI / Shadcn, Lucide Icons
* **State & Forms**: React Hook Form, Zod Validation, Sonner Notifications
* **Authentication**: NextAuth.js (Credentials, Email Verification, Google OAuth, RBAC)
* **Database Access**: Drizzle ORM with PostgreSQL client
* **Payments**: Khalti SDK (`@paybridgejs/khalti`) & eSewa Gateway
* **Media Storage**: Cloudinary Media Pipeline
* **Transactional Email**: Resend API

### 🐍 Backend Tech Stack
* **Framework**: FastAPI (Asynchronous Python Web Server)
* **AI & Multi-Agent Framework**: Google GenAI SDK (`google-genai`), LangGraph, LangChain
* **Database Access**: SQLAlchemy 2.0 (Asyncio), `asyncpg`, Alembic
* **Security & Auth**: PyJWT, Argon2, Passlib, Bcrypt
* **Data Validation**: Pydantic v2 & Pydantic Settings

---

## ✨ Core Platform Modules & Features

### 1. 🤖 AI Trip Planner & Agentic Assistant
* **Personalized Itineraries**: Generates multi-day, budget-aware travel plans based on preferred destinations, duration, pacing, and interests.
* **Database-Grounded Intelligence**: AI agents fetch verified hotels, restaurants, and guides from PostgreSQL so recommendations are 100% bookable and real.
* **Interactive AI Chat Agent**: Natural language assistant supporting contextual queries, booking suggestions, and local etiquette tips.

### 2. 🏨 Accommodations & Hotels
* Browse stays across Kathmandu, Pokhara, Chitwan, Everest Region, Mustang, and more.
* Room inventories, detailed amenities, photo galleries, price breakdowns, and date selection.
* Dedicated **Hotel Partner Portal** for managing listings, room tiers, availability, and guest check-ins.

### 3. 🍽️ Dining & Culinary Experiences
* Curated restaurant catalogs with dietary tags (Halal, Vegan, Traditional Nepali, Newari, Continental).
* Digital menu explorer with pricing and item details.
* Dedicated **Restaurant Partner Portal** for managing orders, tables, and menu catalogs.

### 4. 🧭 Certified Trekking & Tour Guides
* Directory of licensed local guides with languages spoken, specializations, certifications, and daily rates.
* Direct booking system and calendar availability management.
* Dedicated **Guide Partner Portal** to manage package offerings and trek schedules.

### 5. 📍 Destinations & Interactive Exploration
* Rich destination overviews with coordinates, altitude, entry permits, weather insights, and best seasons to visit.
* Interactive map integration for accurate geographical awareness.

### 6. 💳 Integrated Payments & Expense Tracking
* Seamless local payments via **Khalti** and **eSewa**.
* In-trip expense manager with categorical breakdowns (stay, food, transport, permits, gear).
* Automated AI expense health checks and budget summaries.

### 7. 🚨 1-Click SOS Instant Emergency Protocol
* Rapid safety trigger sharing live coordinates, contact information, and medical emergency details.
* Direct access to tourist police numbers, local hospitals, and rescue services.

### 8. 🛡️ Role-Based Access Control (RBAC) & Admin Hub
* 5 distinct user roles: `tourist`, `hotelOwner`, `restaurantOwner`, `guide`, and `admin`.
* Partner KYC Onboarding flow with identity and license verification.
* **Unified Admin Workspace**: Review partner applications, inspect platform analytics, manage bookings, and moderate users.

---

## 📁 Repository Structure

```text
minor-project/
├── frontend/                          # Next.js 16 Web Application
│   ├── app/                           # App Router (Pages, Layouts, Server Actions)
│   │   ├── (auth)/                    # Sign-in, sign-up, email verification, onboarding
│   │   ├── api/                       # Next.js API route handlers (Auth, Cloudinary, Bookings, AI)
│   │   ├── bookings/                  # User booking management and trip overview
│   │   ├── dashboard/                 # Role-based dashboards (Admin, Hotel, Restaurant, Guide)
│   │   ├── destinations/              # Destination catalogs and detail views
│   │   ├── emergency/                 # 1-Click SOS emergency safety view
│   │   ├── features/                  # Modular feature components (Admin, AI, Landing, Auth)
│   │   ├── guides/                    # Guide listings and booking modal
│   │   ├── hotels/                    # Hotel listings and room detail views
│   │   ├── itinerary/                 # Generated itinerary viewer & map integration
│   │   ├── lib/                       # Database client (Drizzle), schemas, seeds, utils
│   │   ├── payment/                   # Payment gateway callbacks and success views
│   │   └── restaurants/               # Restaurant directory and digital menus
│   ├── components/                    # Reusable UI component library (Shadcn / Radix)
│   ├── drizzle/                       # Database migration SQL and schema snapshots
│   ├── public/                        # Static assets, hero imagery, videos, and SVGs
│   ├── package.json                   # Frontend npm dependencies and scripts
│   ├── next.config.ts                 # Next.js configuration and image domains
│   └── tsconfig.json                  # TypeScript compiler options
│
├── backend/                           # FastAPI Python Backend & AI Engine
│   ├── api/                           # Vercel serverless entry point (`index.py`)
│   ├── app/
│   │   ├── api/                       # API router endpoints (Auth, Hotels, AI, Bookings, etc.)
│   │   ├── core/                      # App configuration, security, JWT, and database session
│   │   ├── models/                    # SQLAlchemy database models
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   ├── services/                  # Business logic (AI Planner, Gemini Agent, Catalog, Auth)
│   │   └── main.py                    # FastAPI application initialization and CORS middleware
│   ├── docs/                          # API documentation and architectural notes
│   ├── sql/                           # Seed SQL scripts and raw schema definitions
│   ├── tests/                         # Backend test suite (pytest, async tests)
│   ├── requirements.txt               # Python package dependencies
│   ├── Dockerfile                     # Containerization build configuration
│   ├── vercel.json                    # Vercel deployment rewrite rules
│   └── Makefile                       # Backend convenience targets
│
├── .gitignore                         # Unified gitignore for Node & Python
├── package.json                       # Monorepo root helper scripts
└── README.md                          # Platform documentation
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js**: v20.x or higher
* **Python**: v3.11 or higher
* **PostgreSQL**: Local database or cloud provider (e.g. Neon / Supabase)

---

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/abhisekgupta7/minor-project.git
cd minor-project
```

#### Setup Frontend Environment (`frontend/.env`)
```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-32-char-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# FastAPI Backend URL
FASTAPI_BASE_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_FASTAPI_BASE_URL="http://127.0.0.1:8000"

# Resend Email & Cloudinary
RESEND_API_KEY="re_your_api_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Khalti
KHALTI_SECRET_KEY="your_khalti_secret_key"
KHALTI_PUBLIC_KEY="your_khalti_public_key"
```

#### Setup Backend Environment (`backend/.env`)
```env
DATABASE_URL="postgresql+asyncpg://user:password@host/dbname"
JWT_SECRET="tourism_platform_secret_key123"
CORS_ORIGINS="http://localhost:3000"
GEMINI_API_KEY="AIzaSyYourGeminiApiKey"
GEMINI_MODEL="gemini-2.5-flash"
```

---

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm --prefix frontend install

# Install backend dependencies (in a virtual environment)
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

### Step 3: Run the Development Servers

From the root directory:

```bash
# Run Next.js Frontend (http://localhost:3000)
npm run dev

# Run FastAPI Backend (http://127.0.0.1:8000)
npm run dev:backend
```

Interactive API documentation will be accessible at:
* **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🌐 Production Deployment Guide

### Deploying to [Vercel](https://vercel.com/) (Recommended Setup)

You can deploy both **Frontend** and **Backend** as two separate Vercel projects from this single repository:

#### 1. Deploy the Backend Project (`travelnepal-api`)
1. In Vercel, click **Add New...** $\rightarrow$ **Project** and select this repository.
2. Under **Root Directory**, click *Edit* and select **`backend`**.
3. Framework Preset: Leave as default (Vercel automatically applies Python Serverless runtime).
4. Add environment variables: `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, etc.
5. Click **Deploy** and copy the live URL (e.g., `https://travelnepal-api.vercel.app`).

#### 2. Deploy the Frontend Project (`travelnepal-web`)
1. In Vercel, click **Add New...** $\rightarrow$ **Project** and select this repository.
2. Under **Root Directory**, click *Edit* and select **`frontend`**.
3. Framework Preset: **Next.js**.
4. Add environment variables:
   * `FASTAPI_BASE_URL`: `https://travelnepal-api.vercel.app`
   * `NEXT_PUBLIC_FASTAPI_BASE_URL`: `https://travelnepal-api.vercel.app`
   * `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, etc.
5. Click **Deploy**.

---

## 🤝 Contribution & Git Workflow

We follow a structured Git branching workflow:

```text
Upstream Repository (main)
        ▲
        │  Pull Request (PR)
        │
Forked Repository (origin)
        ▲
        │  git push
        │
Local Feature Branch (feat/feature-name)
```

1. Sync local `main` with upstream: `git pull upstream main`
2. Create a new branch: `git checkout -b feat/your-feature-name`
3. Commit with descriptive conventional commits (`feat:`, `fix:`, `refactor:`)
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a Pull Request on GitHub against `upstream:main`.

---

## 📄 License & Academic Note

This project is developed as an academic **Minor Project** for Bachelor in Computer Engineering / Information Technology. All rights reserved.
