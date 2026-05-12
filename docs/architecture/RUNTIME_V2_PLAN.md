# BMBOU ERP — Runtime V2 Architecture

## Final Product
archive-os

---

## Runtime Sources

### Business Runtime Source
Local-Dexie-Cache/artifacts/pos

Provides:
- POS flows
- Inventory logic
- Finance logic
- Repair workflows
- CRM runtime
- Operational modules

---

### Architecture Runtime Source
Archive-Memory-Layer

Provides:
- Runtime kernel
- Event bus
- State engine
- UI system
- Runtime orchestration
- Navigation architecture
- Read model architecture

---

## Migration Philosophy

Do not rewrite working business logic.

Wrap, stabilize, isolate, and modernize incrementally.

---

## Runtime V2 Objectives

1. Stabilize operational runtime
2. Introduce centralized event architecture
3. Introduce unified state engine
4. Replace procedural navigation
5. Build adaptive workspace shell
6. Standardize UI runtime
7. Enable scalable SaaS architecture

---

## Current Runtime Status

### Stable
- POS
- Inventory
- Finance
- Repair
- Domain services
- Pricing intelligence

### Unstable
- UI consistency
- Navigation
- Layout system
- State coupling
- Manual screen orchestration

---

## Runtime V2 Foundation

### Imported Packages

- packages/runtime-core
- packages/event-bus
- packages/state-engine
- packages/ui-system

---

## Golden Rule

Any working operational workflow must not be rewritten without necessity.

Prefer:
- adapters
- wrappers
- registries
- orchestration layers

Over:
- destructive rewrites
