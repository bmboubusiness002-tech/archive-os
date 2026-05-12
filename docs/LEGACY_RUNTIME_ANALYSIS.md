# Legacy Runtime Analysis

## Executive Summary

The imported Local-Dexie POS runtime is not a disposable prototype.
It is an operational ERP kernel containing:

- POS transaction runtime
- Inventory persistence
- Accounting primitives
- Repair workflows
- HR entities
- Offline-first infrastructure
- Event-driven flows
- Intelligence-oriented modules

The primary architectural issue is not lack of functionality.
The primary issue is boundary erosion and UI-business coupling.

---

# Preserved Systems

## Offline Runtime Database

Location:

```txt
legacy/local-dexie-pos-src/modules/pos/pos.db.js
```

Current strengths:

- Dexie schema versioning
- Transaction-aware persistence
- Multi-domain storage
- Offline-first runtime
- Incremental schema evolution

Domains already represented:

- products
- sales
- stock
- quotations
- suppliers
- repair tickets
- warehouses
- accounting
- employees
- payroll
- branches
- system settings

Decision:

```txt
PRESERVE + EXTRACT
```

---

## Sales Transaction Runtime

Location:

```txt
salesRepo.create(cart)
```

Strengths:

- Atomic transactional flow
- Inventory decrement integration
- Receipt-ready structure
- Sale item persistence

Decision:

```txt
PRESERVE + NORMALIZE
```

---

## Event Bus

Location:

```txt
modules/pos/pos.events.js
```

Strengths:

- Lightweight publish/subscribe model
- Runtime extensibility
- Operational event hooks

Weaknesses:

- Untyped events
- No domain separation
- No telemetry standards

Decision:

```txt
PRESERVE + MODERNIZE
```

---

## Intelligence Layer

Observed areas:

- pricing intelligence
- forecasting
- analytics
- simulation
- operational metrics

Decision:

```txt
PRESERVE CAREFULLY
```

This layer contains strategic ERP differentiation potential.

---

# High-Risk Areas

## UI-Business Coupling

Current issue:

```txt
Flows directly invoke UI modals
```

Example:

```js
openCartModal()
openPaymentModal()
openReceiptModal()
```

Impact:

- difficult testing
- impossible headless runtime
- difficult mobile reuse
- fragile architecture

Decision:

```txt
FULL REFACTOR
```

---

## Monolithic Screens

Problem:

Legacy screens mix:

- rendering
- state
- persistence
- business rules
- workflow logic

Decision:

```txt
REBUILD UI LAYER
```

---

## Naming Entropy

Observed:

- inconsistent architecture naming
- experimental cognition terminology
- overlapping runtime concepts

Decision:

```txt
NORMALIZE TERMINOLOGY
```

---

# Migration Strategy

## Phase 1 — Runtime Stabilization

Goals:

- preserve transactional integrity
- isolate runtime core
- freeze legacy schemas
- document operational flows

Deliverables:

- runtime map
- extraction matrix
- domain inventory

---

## Phase 2 — Runtime Extraction

New structure:

```txt
apps/web/src/domains/
```

Planned domains:

```txt
pos/
inventory/
customers/
accounting/
repair/
analytics/
```

---

## Phase 3 — Infrastructure Isolation

Targets:

```txt
packages/database
packages/events
packages/types
packages/sdk
```

---

## Phase 4 — Enterprise UI Reconstruction

Replace:

- legacy CSS
- legacy layout system
- monolithic screens

Introduce:

- unified design system
- responsive workspace shell
- enterprise navigation
- adaptive dashboards
- operational telemetry UI

---

# Extraction Priorities

## Priority 1

- POS runtime
- cart logic
- sales flow
- stock synchronization

## Priority 2

- inventory runtime
- pricing engine
- customer runtime

## Priority 3

- accounting runtime
- repair workflows
- reporting

## Priority 4

- intelligence services
- forecasting
- operational analytics
- strategic simulation

---

# Architectural Direction

Target architecture:

```txt
UI
↓
Application Layer
↓
Domain Runtime
↓
Infrastructure
↓
Offline + Cloud Persistence
```

Core principles:

- Offline-first
- Runtime-safe
- Event-driven
- Domain-oriented
- AI-ready
- Enterprise modularity
- Incremental migration

---

# Immediate Next Step

Build:

```txt
apps/web/src/core/runtime/
```

Then begin:

```txt
POS Runtime Extraction Pass 1
```

without breaking the operational kernel.
