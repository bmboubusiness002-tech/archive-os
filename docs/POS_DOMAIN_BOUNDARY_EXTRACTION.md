# POS Domain Boundary Extraction

## Objective

Define the operational boundaries of the POS domain before runtime extraction begins.

This phase establishes:

- domain ownership
- runtime responsibilities
- data boundaries
- application orchestration boundaries
- infrastructure separation
- UI isolation

Goal:

Prevent architectural collapse during migration.

---

# Legacy POS Runtime

Current source:

```txt
legacy/local-dexie-pos-src/modules/pos/
```

Current runtime mixes:

- UI rendering
- modal orchestration
- transactional logic
- persistence
- events
- inventory updates
- receipt generation

This creates:

```txt
boundary erosion
```

---

# Target POS Domain Structure

Future location:

```txt
apps/web/src/domains/pos/
```

Target architecture:

```txt
domains/pos/
├── domain/
├── application/
├── infrastructure/
├── state/
├── hooks/
├── services/
├── components/
└── pages/
```

---

# Domain Boundary Rules

## Domain Layer

Responsibilities:

- cart entities
- sale entities
- payment entities
- pricing rules
- totals calculation
- transactional invariants

Forbidden:

- UI imports
- database calls
- modal logic
- rendering
- framework hooks

---

## Application Layer

Responsibilities:

- checkout orchestration
- create sale workflows
- session workflows
- payment coordination
- receipt orchestration

Allowed dependencies:

```txt
Domain
Infrastructure contracts
Events
```

Forbidden:

```txt
Direct rendering
Modal invocation
DOM access
```

---

## Infrastructure Layer

Responsibilities:

- Dexie persistence
- repository implementations
- receipt persistence
- event adapters
- local storage bridges

Future extraction targets:

```txt
packages/database
packages/events
```

---

## State Layer

Responsibilities:

- cart state
- active session state
- temporary checkout state
- optimistic runtime state

Technology direction:

```txt
Zustand
```

---

## Hooks Layer

Responsibilities:

- UI/runtime integration
- workflow bindings
- async orchestration helpers
- reactive runtime subscriptions

Examples:

```txt
use-pos
use-cart
use-checkout
use-pos-session
```

---

## Components Layer

Responsibilities:

- product grid
- cart panels
- payment modals
- receipt preview
- checkout controls

Rules:

Components must never contain business rules.

---

## Pages Layer

Responsibilities:

- workspace composition
- layout orchestration
- navigation integration
- operational UX flow

Rules:

Pages orchestrate components only.

---

# POS Runtime Ownership

## POS Domain Owns

```txt
cart
checkout
payments
receipts
sessions
sale transactions
```

---

# External Dependencies

## Inventory Domain

POS may:

- read stock availability
- decrement stock
- emit stock events

POS may NOT:

- manage warehouse architecture
- manage procurement
- manage BOM systems

---

## Accounting Domain

POS may:

- emit accounting entries
- emit cash movement events

POS may NOT:

- manage ledger structure
- own accounting rules

---

## Customer Domain

POS may:

- attach customers to sales
- query customer credit

POS may NOT:

- own CRM workflows
- own customer lifecycle logic

---

# Runtime Event Boundaries

## Allowed POS Events

Examples:

```txt
sale.created
sale.completed
payment.received
receipt.generated
session.opened
session.closed
stock.decremented
```

Future direction:

```txt
Typed domain events
```

---

# Extraction Priorities

## First Extraction Targets

1. createSale()
2. salesRepo
3. cart runtime
4. checkout orchestration
5. receipt generation
6. stock synchronization

---

# High-Risk Areas

## Current Risks

```txt
UI-coupled runtime
Shared mutable state
Untyped events
Direct persistence usage
Modal-driven workflows
```

---

# Migration Safety Rules

## During Early Extraction

Do NOT:

- rewrite persistence logic
- redesign transaction lifecycle
- modify Dexie schemas
- merge runtime with UI again
- introduce premature abstractions

---

# Immediate Next Step

Begin:

```txt
POS Runtime Core Extraction
```

Target:

```txt
apps/web/src/domains/pos/
```

while preserving:

- transaction integrity
- offline behavior
- operational stability
- inventory synchronization
- receipt consistency
