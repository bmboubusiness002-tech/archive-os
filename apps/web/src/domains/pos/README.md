# BMBOU ERP POS Runtime

## Purpose

This directory contains the new-generation POS runtime for BMBOU ERP.

The runtime is being extracted carefully from the legacy Local-Dexie operational kernel.

Goal:

- preserve operational reliability
- modernize architecture
- isolate domain logic
- rebuild enterprise UX
- support offline-first workflows
- prepare AI-ready analytics

---

# Runtime Architecture

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

# Architectural Principles

## Domain Isolation

Business rules must never depend on:

- UI rendering
- DOM APIs
- framework components
- modal systems

---

## Offline-First Runtime

The POS runtime must remain operational during:

- connectivity loss
- partial synchronization
- unstable networks

---

## Transaction Integrity

Critical runtime flows:

- checkout
- stock decrement
- receipt generation
- payment processing

must preserve consistency.

---

## Event-Driven Runtime

Future runtime evolution will rely on:

- typed domain events
- operational telemetry
- analytics pipelines
- workflow signals

---

# Initial Extraction Targets

## Phase 1

- cart runtime
- createSale orchestration
- salesRepo isolation
- stock synchronization
- receipt generation

---

# Runtime Safety Rules

Do NOT:

- rewrite legacy persistence blindly
- modify Dexie schemas prematurely
- merge UI and business logic
- bypass runtime contracts

---

# UI Reconstruction

The new POS workspace will eventually include:

- adaptive product grid
- responsive cart system
- modern checkout flow
- operational telemetry
- branch-aware sessions
- multi-language runtime
- enterprise dashboard integration

---

# When Will UI Become Visible?

The first visible operational POS UI will appear after:

1. runtime boundaries stabilize
2. cart runtime extraction completes
3. state contracts are introduced
4. workspace shell integration begins

Estimated milestone:

```txt
POS Runtime Extraction Pass 2
```

At that stage:

- the POS page becomes navigable
- checkout interactions become visible
- the runtime starts operating inside BMBOU ERP shell

without depending on the legacy screens.
