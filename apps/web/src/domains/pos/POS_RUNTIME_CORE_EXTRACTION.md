# POS Runtime Core Extraction

## Purpose

This document defines the first operational extraction of the BMBOU ERP POS Runtime Core.

Goal:

- preserve operational reliability
- isolate transactional runtime
- separate UI from business logic
- prepare enterprise-grade POS architecture
- enable future workspace rendering

---

# Runtime Core Scope

The first extracted runtime core includes:

- cart runtime
- sale transaction orchestration
- checkout lifecycle
- payment coordination
- receipt generation contracts
- stock synchronization boundaries

---

# Initial Runtime Components

## Cart Runtime

Responsibilities:

- add product
- remove product
- quantity mutation
- totals calculation
- discount calculation
- cart reset

Rules:

- framework-independent
- UI-independent
- deterministic
- testable

---

## Checkout Runtime

Responsibilities:

- validate cart
- coordinate payment
- invoke sale transaction
- generate receipt payload
- emit runtime events

Forbidden:

- direct modal calls
- DOM operations
- UI rendering

---

## Sales Runtime

Responsibilities:

- sale creation
- sale item persistence
- inventory synchronization
- transaction integrity

Current source:

```txt
legacy/local-dexie-pos-src/app/usecases/createSale.js
```

---

## Receipt Runtime

Responsibilities:

- receipt payload generation
- receipt formatting contracts
- print preparation
- future PDF compatibility

---

# Runtime Extraction Rules

## Preserve Legacy Behavior

The runtime must preserve:

- totals consistency
- inventory consistency
- offline functionality
- transaction sequencing
- operational stability

---

## Avoid Premature Rewrites

Do NOT:

- redesign checkout logic blindly
- rewrite persistence layer
- modify Dexie schemas
- rebuild inventory synchronization

---

# Future Runtime Layout

Target structure:

```txt
apps/web/src/domains/pos/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── contracts/
│
├── application/
│   ├── checkout/
│   ├── sales/
│   └── sessions/
│
├── infrastructure/
│   ├── repositories/
│   ├── persistence/
│   └── adapters/
│
├── state/
├── hooks/
├── services/
├── components/
└── pages/
```

---

# UI Reconstruction Timeline

The visible POS UI begins after:

1. cart runtime extraction
2. checkout runtime stabilization
3. state contracts introduction
4. workspace integration

At that point:

```txt
POS Workspace Preview becomes testable
```

---

# First Visible POS Features

Planned first UI milestone:

- responsive product grid
- live cart sidebar
- dynamic totals
- payment panel
- receipt preview
- offline status
- session header
- enterprise navigation integration

---

# Design Direction

The new BMBOU ERP POS experience should feel:

- operational
- modern
- adaptive
- real-time
- enterprise-grade
- analytics-aware
- tactile and responsive

Target inspiration:

- Linear
- Stripe Dashboard
- Shopify POS
- Notion adaptive layouts
- modern SaaS operational systems

while remaining:

```txt
Offline-first operational ERP
```

---

# Immediate Next Runtime Target

Begin extraction of:

```txt
Cart Runtime
```

as the first true operational kernel of the new BMBOU POS Runtime.
