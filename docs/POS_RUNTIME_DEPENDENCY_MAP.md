# POS Runtime Dependency Map

## Purpose

This document maps the runtime dependencies, transactional flows, operational boundaries, and infrastructure interactions of the legacy POS runtime.

Goal:

- identify critical runtime paths
- isolate business logic
- prevent unsafe refactors
- prepare controlled extraction
- establish future domain boundaries

---

# Runtime Entry Layer

## Primary POS Runtime

Location:

```txt
legacy/local-dexie-pos-src/modules/pos/
```

Files:

```txt
cart.engine.js
payment.flow.js
pos.controller.js
pos.db.js
pos.events.js
pos.flow.js
pos.screen.js
returns.screen.js
sessions.screen.js
```

---

# Transaction Runtime Flow

## Current Checkout Flow

```txt
User Action
↓
POS Screen
↓
createPOSFlow()
↓
Cart Runtime
↓
Cart Modal
↓
Payment Modal
↓
createSale()
↓
salesRepo.create(cart)
↓
Dexie Transaction
↓
Stock Update
↓
Receipt Modal
↓
Event Emission
```

---

# Runtime Dependencies

## POS Flow Dependencies

File:

```txt
modules/pos/pos.flow.js
```

Current dependencies:

```txt
ui/modals/cart.modal.js
ui/modals/payment.modal.js
ui/modals/receipt.modal.js
app/usecases/createSale.js
```

Problem:

Business runtime depends directly on UI rendering.

Risk Level:

```txt
HIGH
```

Decision:

```txt
DECOUPLE UI FROM FLOW
```

---

# Application Layer

## createSale Usecase

Current responsibility:

- sale orchestration
- persistence trigger
- payment integration
- stock synchronization

Target future location:

```txt
apps/web/src/domains/pos/application/
```

---

# Persistence Layer

## salesRepo

Current responsibilities:

- create sale
- persist sale items
- update inventory quantities
- maintain transactional integrity

Dependencies:

```txt
Dexie runtime
inventory persistence
receipt structures
```

Risk Level:

```txt
CRITICAL
```

Decision:

```txt
PRESERVE DURING EARLY EXTRACTION
```

---

# Database Runtime

## pos.db.js

Current role:

Unified offline operational database.

Domains represented:

```txt
sales
products
customers
quotations
suppliers
repair
warehouses
accounting
employees
payroll
installments
banking
branches
```

Architecture type:

```txt
Offline-first ERP persistence runtime
```

Future destination:

```txt
packages/database
```

---

# Event Runtime

## pos.events.js

Current event system:

```js
on(event)
emit(event)
```

Current usage:

- runtime notifications
- operational updates
- flow propagation

Weaknesses:

- untyped payloads
- no domain isolation
- no telemetry contracts

Future destination:

```txt
packages/events
```

---

# UI Runtime Layer

## Legacy Screens

Files:

```txt
pos.screen.js
returns.screen.js
sessions.screen.js
```

Current problems:

- mixed responsibilities
- direct state mutation
- UI-business coupling
- runtime orchestration inside rendering layer

Decision:

```txt
REBUILD USING BMBOU ERP DESIGN SYSTEM
```

---

# Runtime Boundary Problems

## Boundary Violations

Observed violations:

```txt
UI ↔ Business
Business ↔ Persistence
Flow ↔ Rendering
Events ↔ Untyped Runtime
```

Impact:

- low maintainability
- difficult scaling
- difficult testing
- fragile runtime evolution

---

# Planned Runtime Boundaries

## Future Architecture

```txt
UI Layer
↓
Hooks + State
↓
Application Usecases
↓
Domain Runtime
↓
Infrastructure
↓
Database Runtime
```

---

# Extraction Priorities

## Priority 1

Stabilize:

- createSale
- salesRepo
- stock updates
- receipt generation
- transaction integrity

---

## Priority 2

Extract:

- cart runtime
- checkout flow
- payment flow
- session flow

---

## Priority 3

Modernize:

- event contracts
- typed persistence
- runtime telemetry
- analytics hooks

---

# Runtime Safety Rules

## Forbidden During Early Migration

Do NOT:

- rewrite salesRepo
- change Dexie schemas
- remove transaction logic
- redesign persistence blindly
- merge UI and runtime again

---

# Immediate Next Step

Begin:

```txt
POS Domain Boundary Extraction
```

Target:

```txt
apps/web/src/domains/pos/
```

without breaking the operational runtime.
