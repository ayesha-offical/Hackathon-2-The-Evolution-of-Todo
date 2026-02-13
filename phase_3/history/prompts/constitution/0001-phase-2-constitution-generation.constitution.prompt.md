---
id: "0001"
title: Phase 2 Constitution Generation
stage: constitution
date: 2025-01-18
surface: claude-code-cli
model: claude-haiku-4-5-20251001
feature: none
branch: master
user: ayeshafaisal
command: /sp.constitution
labels: [sdd, governance, phase-2, jwt-bridge, user-isolation]
links:
  spec: .specify/memory/constitution.md
  ticket: null
  adr: null
  pr: null
files:
  modified:
    - .specify/memory/constitution.md
  created:
    - history/prompts/constitution/0001-phase-2-constitution-generation.constitution.prompt.md
tests: null
---

## Prompt

Act as a Senior Prompt and Context Engineer specializing in SDD-RI (Spec-Driven Development with Reusable Intelligence).

Task: Generate a comprehensive speckit.constitution file for Phase 2 of the Todo Full-Stack Web Application.

Context & Requirements:

Stack: Next.js 15 (App Router), FastAPI (Python), SQLModel, Neon Serverless PostgreSQL, and Better Auth.

Architecture: Monorepo structure with /frontend and /backend.

The JWT Bridge (Critical): Constitution must enforce that Better Auth on the frontend issues JWTs, and FastAPI backend must have middleware to verify these tokens using the BETTER_AUTH_SECRET.

User Isolation: Every DB query must be filtered by user_id extracted from the JWT. No user should ever see another user's tasks.

No Manual Coding: Enforce the "No Task = No Code" rule.

Rules for the Constitution (based on Spec-Kit Plus):

Categorization: Organize rules by Architecture, Security, Database, and Frontend/Backend patterns.

Statelessness: Enforce that the backend remains stateless.

Error Handling: Define how 401 Unauthorized and 403 Forbidden should be handled across the stack.

Naming Conventions: Enforce Pydantic models for API and Server Components for UI.

Output Format: Provide the content in a clean Markdown format inside a file named speckit.constitution. Do not add fluff; focus on actionable constraints that an AI agent must obey.

## Response snapshot

Generated Phase 2 Todo App Constitution (v1.0.0) with the following sections:

**Core Principles (6 principles):**
1. Spec-Driven Development (SDD) — "No Task = No Code" rule
2. The JWT Bridge (Security Critical) — Better Auth frontend ↔ FastAPI backend integration
3. User Isolation & Multi-Tenancy — user_id filtering on all queries and responses
4. Stateless Backend Architecture — horizontally scalable, deterministic FastAPI
5. Error Handling & HTTP Semantics — standardized status codes and error responses
6. No Manual Coding Rule — AI-only code generation with co-author attribution

**Technology Stack & Dependencies:**
- Backend: Python 3.11+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth (JWT), pytest, ruff
- Frontend: Next.js 15+, React 18+, Tailwind CSS, Better Auth client, React Hook Form
- Shared: Pydantic models, TypeScript interfaces, versioned API routes

**Development Workflow & Discipline:**
- Code organization (backend/src, frontend/src structure)
- Task execution & delivery (Task ID traceability, comment requirements)
- Verification checklist (linting, testing, secrets, co-author)

**Governance:**
- Constitution authority hierarchy (Constitution > Spec > Plan > Tasks)
- Amendment process with semantic versioning (MAJOR/MINOR/PATCH)
- Compliance review procedures
- Enforcement rules and failure modes

**Glossary:** Task ID, User Story, JWT, user_id, PHR, SDD, Stateless

## Outcome

- ✅ Impact: Constitution establishes single source of truth for Phase 2 governance; eliminates ambiguity on security (JWT, user isolation), architecture (stateless), and code generation (SDD, no manual coding)
- 🧪 Tests: N/A (governance document, not executable code)
- 📁 Files: .specify/memory/constitution.md (created/updated), PHR record (created)
- 🔁 Next prompts: `/sp.specify` (feature specification), `/sp.plan` (architecture planning), `/sp.tasks` (task breakdown)
- 🧠 Reflection: Constitution covers all critical aspects: security (JWT bridge + user isolation), architecture (statelessness), process (SDD), and enforcement (no manual coding). Ready for feature specs to reference against.

## Evaluation notes (flywheel)

- Failure modes observed: None; all placeholders filled concretely
- Graders run and results (PASS/FAIL): N/A (governance, no automated grading)
- Prompt variant (if applicable): N/A (first attempt)
- Next experiment: After feature specs are generated, run compliance check to ensure specs reference Constitution principles correctly
