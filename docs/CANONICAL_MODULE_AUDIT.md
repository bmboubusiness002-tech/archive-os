# Canonical Module Audit

## Objective

This document classifies the real operational state of modules inside `archive-os`.

The goal is to stop uncontrolled expansion and establish a stabilization protocol.

---

# Classification Rules

Every module or runtime component must belong to exactly one primary state:

| State | Meaning |
|---|---|
| canonical | trusted production direction |
| live | operational and usable |
| partial | implemented but incomplete |
| placeholder | route exists but logic incomplete |
| duplicate | overlaps another implementation |
| legacy | old architecture retained temporarily |
| broken | runtime or business failures exist |
| disposable | safe to remove after dependency validation |

---

# Core Runtime Audit

| Area | Status | Notes |
|---|---|---|
| runtime/state | canonical | central runtime coordination |
| runtime/audit | canonical | strong observability direction |
| runtime/recovery | partial | recovery model exists but incomplete |
| runtime/registry | canonical | route and module registration foundation |
| events/event.stream | partial | event architecture not fully unified |
| core/action.bus | duplicate | overlaps with event stream concepts |
| core/accounting | canonical | critical business truth layer |
| core/backup | partial | useful but not fully integrated |
| core/control | partial | governance direction exists |
| core/adaptive | experimental | requires business constraints |

---

# Database Audit

## Current Risk

Two active database architectures coexist:

## Layer A

`src/infra/db/db.js`

Characteristics:
- IndexedDB raw API
- canonical business stores
- ledger-oriented direction
- operational truth candidate

## Layer B

`src/modules/pos/pos.db.js`

Characteristics:
- Dexie abstraction
- module-oriented schemas
- rapid UI development layer
- partially duplicated entities

## Required Decision

A canonical persistence architecture must be selected.

Recommended direction:

```text
Canonical Truth Layer
    ↓
Repository Layer
    ↓
Dexie Adapter / IndexedDB Adapter
    ↓
UI modules
```

UI modules must never own business truth directly.

---

# Business Module Audit

| Module | Status | Notes |
|---|---|---|
| POS | live | operational foundation exists |
| Sales | partial | requires transaction normalization |
| Purchase | partial | workflows incomplete |
| Inventory | live | strong direction but requires stock unification |
| Repair | live | one of the strongest business domains |
| CRM | partial | customer intelligence direction exists |
| Finance | partial | accounting engines exist but not fully enforced |
| Intelligence | experimental | highly promising but requires governed inputs |
| HR | placeholder | mostly UI/runtime scaffolding |
| Manufacturing | placeholder | architecture only |
| Reports | partial | reporting surfaces exist |
| Admin | partial | governance incomplete |

---

# Canonical Truth Rules

## Inventory Truth

Stock must be derivable from:

```text
opening balance
+ purchases
+ returns in
- sales
- consumption
- wastage
- repair part usage
```

No screen value should be treated as truth by itself.

---

## Financial Truth

Profit must derive from:

```text
Revenue
- COGS
- operating expenses
- repair part consumption
- payroll
- recurring obligations
```

---

## Repair Truth

Repair lifecycle must become event-driven:

```text
received
→ diagnosing
→ awaiting parts
→ repairing
→ testing
→ ready
→ delivered
```

---

# Stabilization Protocol

## Phase 1 — Freeze

Do not add major new modules.

Allowed:
- bug fixes
- canonicalization
- refactors
- runtime cleanup
- dependency cleanup
- schema normalization
- documentation

---

## Phase 2 — Consolidation

Priorities:

1. unify persistence
2. unify events
3. unify transaction flow
4. remove duplicate services
5. normalize imports
6. define canonical repositories
7. define domain boundaries

---

## Phase 3 — Governance

Required additions:

- runtime contracts
- transaction guarantees
- validation boundaries
- audit policies
- migration strategy
- error recovery policies
- deterministic state transitions

---

# Long-Term Product Direction

Target identity:

```text
Operational Intelligence ERP Runtime
for retail + repair + inventory businesses
```

The competitive edge is not generic ERP breadth.

The competitive edge is:
- operational intelligence
- repair workflow depth
- offline-first runtime
- business-event reasoning
- lightweight deployment
- shop-native workflow design
