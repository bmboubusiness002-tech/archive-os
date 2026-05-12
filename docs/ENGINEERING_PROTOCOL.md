# ENGINEERING_PROTOCOL

## Purpose

This document defines the architectural and engineering rules for Archive OS.
All implementation decisions must align with this protocol.

---

# Core Principles

- Product-first architecture
- Incremental vertical slices
- Modular monolith
- TypeScript everywhere
- Strict folder discipline
- Domain-oriented development
- Concrete before abstract
- UX-first operational surfaces

---

# Approved Stack

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- Zustand
- TanStack Query

## Backend

- Fastify
- TypeScript
- PostgreSQL
- Drizzle ORM
- Zod

## Infrastructure

- GitHub
- GitHub Actions
- Vercel
- Neon or Railway PostgreSQL

## Monorepo

- pnpm
- Turborepo

---

# Repository Structure

```txt
archive-os/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── sdk/
│   ├── config/
│   ├── database/
│   ├── auth/
│   ├── validation/
│   └── utils/
│
├── domains/
├── platform/
├── infrastructure/
├── docs/
└── .github/
```

---

# Forbidden Patterns

Do NOT introduce:

- Microservices
- Runtime orchestration systems
- Graph runtimes
- Dynamic universal renderers
- Premature abstractions
- Runtime cognition systems
- Hidden magic layers

---

# Product Build Order

1. Foundation
2. Enterprise Shell
3. Core UI Components
4. Inventory
5. POS
6. CRM
7. RepairFlow
8. Finance
9. Accounting
10. HRM
