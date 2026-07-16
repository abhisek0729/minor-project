# AI-Powered Unified Tourist Platform with Personalized Tourism Solutions

## Overview

This project is a **Minor Project** focused on building an **AI-powered unified tourism platform** that helps users plan and manage trips through personalized recommendations and intelligent automation.

The project is developed collaboratively by four teams, each responsible for a separate area of the system.

---

# Team Structure

The project is divided into the following development streams:

| Branch          | Responsibility                                                                            |
| --------------- | ----------------------------------------------------------------------------------------- |
| `frontend`      | User interface, pages, components, styling, and client-side logic                         |
| `backend`       | APIs, authentication, business logic, database integration, and server-side functionality |
| `ai`            | AI agents, recommendation engine, itinerary generation, and LLM integrations              |
| `data-pipeline` | Data collection, preprocessing, ETL workflows, and tourism data management                |

Each contributor should work only on the branch assigned to their team unless instructed otherwise.

---

# Collaboration Workflow

We use a **Fork → Branch → Pull Request** workflow.

## Step 1: Fork the Repository

Create your own copy of the repository by clicking **Fork** on GitHub.

---

## Step 2: Clone Your Fork

```bash
git clone <your-fork-url>
cd minor-project
```

---

## Step 3: Add the Original Repository as Upstream

```bash
git remote add upstream <original-repository-url>
```

Verify:

```bash
git remote -v
```

---

## Step 4: Create or Switch to Your Assigned Branch

### Frontend Team

```bash
git checkout -b frontend
```

### Backend Team

```bash
git checkout -b backend
```

### AI Team

```bash
git checkout -b ai
```

### Data Pipeline Team

```bash
git checkout -b data-pipeline
```

If the branch already exists:

```bash
git checkout frontend
# or backend / ai / data-pipeline
```

---

## Step 5: Keep Your Branch Updated

Before starting work:

```bash
git fetch upstream
git pull upstream main
```

Resolve any conflicts before continuing development.

---

## Step 6: Make Your Changes

Implement your assigned features and test them locally.

---

## Step 7: Commit Your Changes

```bash
git add .
git commit -m "feat: add meaningful description of changes"
```

Examples:

```text
feat: implement hotel search page
fix: resolve itinerary API bug
refactor: simplify recommendation service
docs: update project documentation
```

---

## Step 8: Push to Your Fork

```bash
git push origin <your-branch-name>
```

Example:

```bash
git push origin frontend
```

---

## Step 9: Create a Pull Request

1. Open your fork on GitHub.
2. Click **Compare & Pull Request**.
3. Set the base repository to the original project.
4. Target the `main` branch.
5. Provide a clear title and description of your changes.
6. Submit the Pull Request.

---

## Step 10: Code Review

The project owner or maintainer will:

* Review the submitted code.
* Request changes if necessary.
* Approve the Pull Request.
* Merge it into the `main` branch once it satisfies project standards.

Do **not** merge your own Pull Request unless explicitly authorized.

---

# Repository Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

# Best Practices

* Work only in your assigned branch.
* Pull the latest changes before starting new work.
* Write clear and descriptive commit messages.
* Keep Pull Requests focused on a single feature or fix.
* Test your code before submitting.
* Avoid committing secrets, API keys, or environment files.
* Resolve merge conflicts before requesting review.

---

# Project Workflow Summary

```text
Fork Repository
        │
        ▼
Clone Your Fork
        │
        ▼
Checkout Assigned Branch
        │
        ▼
Implement Changes
        │
        ▼
Commit Changes
        │
        ▼
Push to Your Fork
        │
        ▼
Create Pull Request
        │
        ▼
Maintainer Reviews
        │
        ▼
Approved and Merged into Main
```

---

# Need Help?

If you encounter merge conflicts, setup issues, or are unsure where a change belongs, contact the project maintainer before proceeding.

<!-- 
later expansion
attractions,transportation,events,activities,shopping,nightlife,spas,wellness,adventure,sports,culture,history,nature,parks,gardens,museums,galleries,theaters,cinemas,concerts,festivals,fairs,markets,food&wine,tours&excursions -->