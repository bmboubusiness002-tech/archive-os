# LEGACY POS MIGRATION PLAN

## Source

Legacy source selected for migration:

```txt
Local-Dexie-Cache/artifacts/pos/src
```

The entire old repository will NOT be imported.

Only the operational POS source layer is considered relevant.

---

# Migration Objective

Extract reusable operational intelligence, business flows, UI patterns, and offline-first POS behavior from the legacy Dexie-based project into the new BMBOU ERP architecture.

This is NOT a copy-paste migration.

This is:

- architectural extraction
- domain decomposition
- reusable system recovery
- controlled modernization

---

# Strategic Goals

## Preserve

- POS operational logic
- cart workflows
- invoice behavior
- local-first data patterns
- inventory interactions
- customer flow
- pricing logic
- offline responsiveness

## Eliminate

- monolithic coupling
- duplicated state
- hardcoded UI logic
- uncontrolled component nesting
- legacy styling
- inconsistent routing
- mixed responsibilities

## Upgrade

- design system
- routing architecture
- workspace shell
- enterprise navigation
- state boundaries
- domain isolation
- TypeScript rigor
- AI integration readiness

---

# Migration Philosophy

The legacy project becomes:

```txt
Source of operational intelligence
```

NOT:

```txt
Final architecture
```

---

# Expected Legacy Structure

The legacy POS source likely contains:

- UI components
- business state
- Dexie persistence
- inventory models
- cart logic
- checkout flows
- invoice rendering
- customer state
- hooks
- services
- route pages

Each part must be analyzed separately.

---

# Extraction Phases

## Phase 1 — Discovery

Goal:

Map the entire legacy POS structure.

Tasks:

- identify entrypoints
- identify runtime architecture
- detect state management style
- detect routing model
- detect persistence layer
- identify reusable business logic
- identify anti-patterns
- classify UI quality

Deliverables:

- architecture map
- dependency map
- reusable modules list
- technical debt report

---

## Phase 2 — Domain Decomposition

Goal:

Separate business concerns.

Target domains:

```txt
sales/
inventory/
customers/
payments/
pricing/
receipts/
sessions/
repair/
analytics/
```

Tasks:

- isolate business logic
- isolate data access
- isolate UI rendering
- remove direct coupling

---

## Phase 3 — Infrastructure Extraction

Goal:

Extract reusable infrastructure.

Candidate reusable layers:

```txt
Dexie cache layer
local sync patterns
offline persistence
receipt generation
pricing engine
session management
```

Target destination:

```txt
packages/
```

---

## Phase 4 — UI Reconstruction

Goal:

Rebuild the UI inside BMBOU ERP Design DNA.

The old UI will NOT be preserved directly.

It will be:

- redesigned
- normalized
- responsive
- theme-aware
- multilingual
- enterprise-grade

Target:

```txt
apps/web/src/
```

---

## Phase 5 — Operational Integration

Goal:

Integrate POS into the unified workspace.

Target integrations:

- sidebar navigation
- authentication
- branch system
- permissions
- analytics
- dashboard insights
- inventory synchronization
- accounting hooks
- customer CRM

---

# Proposed New Architecture

## Frontend

```txt
apps/web/
```

## Shared packages

```txt
packages/ui
packages/types
packages/sdk
packages/database
packages/utils
packages/validation
```

## Domains

```txt
domains/pos
domains/inventory
domains/customers
domains/finance
```

---

# Critical Architectural Rules

## Forbidden

- direct Dexie calls inside UI
- business logic inside components
- giant context providers
- CSS chaos
- global mutable state
- duplicated schemas
- mixed language strings

## Required

- domain isolation
- typed contracts
- reusable primitives
- workspace consistency
- responsive behavior
- RTL/LTR support
- AI-ready analytics hooks

---

# Migration Risks

## High Risk

- hidden business coupling
- duplicated models
- legacy async race conditions
- inconsistent naming
- UI tightly bound to data

## Mitigation

- migrate incrementally
- isolate before rewriting
- preserve behavior first
- redesign second
- validate flows continuously

---

# Immediate Next Actions

1. Import only:

```txt
artifacts/pos/src
```

2. Create inventory of files.

3. Classify:

- reusable
- rewrite-required
- obsolete
- infrastructure
- domain logic

4. Build migration matrix.

5. Start extracting:

```txt
cart
inventory
sales
pricing
customers
```

first.

---

# Final Objective

Transform the legacy local-first POS into:

```txt
BMBOU ERP Unified Operational Platform
```

with:

- enterprise UX
- modular architecture
- AI-ready analytics
- scalable domain system
- modern engineering discipline
