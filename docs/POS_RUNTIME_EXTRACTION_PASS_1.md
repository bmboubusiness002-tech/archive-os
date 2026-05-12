# POS Runtime Extraction Pass 1

## Objective

Begin the controlled extraction of the legacy POS runtime into the new BMBOU ERP architecture without breaking operational behavior.

This phase focuses on:

- runtime stabilization
- transaction isolation
- domain separation
- infrastructure normalization
- UI decoupling

This is NOT a UI migration phase.

---

# Current Legacy Runtime

Imported source:

```txt
legacy/local-dexie-pos-src/
```

Primary POS runtime files:

```txt
modules/pos/
├── pos.flow.js
├── pos.db.js
├── pos.events.js
├── cart.engine.js
├── payment.flow.js
├── pos.controller.js
├── pos.screen.js
├── returns.screen.js
└── sessions.screen.js
```

---

# Runtime Assessment

## Valuable Runtime Assets

### Transaction Persistence

```txt
salesRepo.create(cart)
```

Preserve.

---

### Dexie Offline Runtime

```txt
pos.db.js
```

Preserve carefully.

---

### Event Bus

```txt
pos.events.js
```

Preserve and modernize.

---

# Critical Problems

## UI Coupling

Current runtime directly invokes:

```js
openCartModal()
openPaymentModal()
openReceiptModal()
```

inside operational flows.

This violates:

- domain isolation
- runtime portability
- testability
- architectural scalability

Decision:

```txt
REMOVE UI DEPENDENCY FROM BUSINESS FLOW
```

---

## Screen Monoliths

Legacy screens combine:

- rendering
- state
- persistence
- workflow orchestration
- operational logic

Decision:

```txt
REBUILD SCREEN LAYER
```

---

# Target Runtime Architecture

## Future POS Structure

```txt
apps/web/src/domains/pos/
├── domain/
├── application/
├── infrastructure/
├── state/
├── hooks/
├── components/
├── pages/
└── services/
```

---

# Extraction Strategy

## Phase A — Runtime Preservation

Preserve:

- transactional logic
- stock updates
- receipt data structures
- persistence flow
- offline behavior

Do NOT rewrite during this phase.

---

## Phase B — Flow Isolation

Separate:

```txt
UI
↓
Application Layer
↓
Domain Runtime
↓
Infrastructure
```

---

## Phase C — Infrastructure Extraction

Move reusable systems into:

```txt
packages/database
packages/events
packages/types
packages/sdk
```

---

## Phase D — UI Reconstruction

Rebuild:

- POS workspace
- cart panels
- checkout flow
- product grid
- receipt preview

inside the BMBOU ERP Design System.

---

# Immediate Runtime Targets

## Preserve First

Priority runtime systems:

1. salesRepo
2. stock updates
3. cart calculations
4. receipts
5. offline persistence
6. event propagation

---

# Temporary Compatibility Rule

Legacy runtime remains read-only until:

- runtime boundaries are mapped
- extraction wrappers exist
- typed contracts exist

No direct destructive refactors are allowed yet.

---

# Extraction Deliverables

## Deliverable 1

Runtime dependency map.

---

## Deliverable 2

POS domain boundary map.

---

## Deliverable 3

Infrastructure abstraction layer.

---

## Deliverable 4

Modern POS workspace shell.

---

# Long-Term Goal

Transform the legacy local-first POS runtime into:

```txt
BMBOU ERP Unified Operational Runtime
```

with:

- enterprise UX
- modular runtime boundaries
- AI-ready analytics
- event-driven telemetry
- scalable domain architecture
- offline-first operational reliability
