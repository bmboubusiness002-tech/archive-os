# Runtime Ownership Audit

## Objective

This audit establishes:

- ownership boundaries
- runtime responsibilities
- dependency direction
- mutation authority
- derived state
- duplicated state
- broken orchestration

The purpose is stabilization before expansion.

---

# 1. Runtime Layer Topology

Current runtime structure:

```text
UI Screens
→ Runtime Shell
→ Services
→ Repositories
→ Dexie Persistence
→ Intelligence Derivations
```

However:

The implementation currently mixes:

- UI logic
- domain logic
- persistence logic
- analytics logic
- orchestration logic

inside screens.

This is the root architectural instability.

---

# 2. Canonical Ownership Matrix

| System | Owns | Reads | Writes | Problems |
|---|---|---|---|---|
| inventory | stock movement | products/sales/repairs | stock balances | duplicated stock truth |
| sales | transaction execution | inventory/customers | ledger/stock | partial accounting linkage |
| finance | ledger truth | sales/expenses | balances | UI larger than engine |
| repair | lifecycle state | customers/inventory | repair state | orchestration incomplete |
| crm | customer truth | sales/repairs | profiles | duplicated customer views |
| runtime | navigation/workspaces | all systems | ui state only | mixed orchestration |
| intelligence | recommendations | all systems | derived only | mock metrics mixed with real |

---

# 3. Critical Source Of Truth Problems

## 3.1 Inventory Split

Current duplicated state:

```text
products.stock
stock_balance
repair parts
cart quantities
```

Problem:

Multiple mutable inventory locations.

Canonical rule:

```text
stock must be event-derived
```

from:

```text
stock_movements
```

only.

---

## 3.2 Customer Split

Observed duplication:

```text
customers
customer profiles
crm customers
repair customers
```

Canonical owner:

```text
customers domain
```

Other systems may extend but not duplicate.

---

## 3.3 Finance Split

Current situation:

```text
sales totals
receipts
expenses
cashflow
reports
```

all partially calculate profitability independently.

Canonical rule:

```text
profitability must derive from ledger truth
```

not UI calculations.

---

# 4. Runtime Shell Analysis

Current runtime shell responsibilities:

- workspace switching
- sidebar rendering
- topbar rendering
- screen mounting
- runtime telemetry
- recovery audit display

This is correct directionally.

However:

business orchestration still leaks into screens.

---

# 5. POS Runtime Analysis

## POS Currently Owns

- cart state
- checkout flow
- receipt generation
- product selection

## POS Currently Violates

- inventory mutation directly
- analytics mutation directly
- UI-driven orchestration

Problem:

```text
screen controls business flow directly
```

instead of:

```text
service orchestration
```

---

# 6. Repair Runtime Analysis

Repair is architecturally advanced.

It already models:

- intake
- diagnostics
- parts
- technician workflow
- billing
- lifecycle

But:

there is no central repair orchestrator.

Consequences:

- duplicated transitions
- inconsistent stock deduction
- profitability inconsistency
- missing technician load balancing

---

# 7. Intelligence Runtime Analysis

Current intelligence systems:

| Engine | Status |
|---|---|
| pricing | partially operational |
| negotiation | partially operational |
| inventory | mostly derived metrics |
| finance | partially operational |
| margin | partially operational |
| customer | mostly analytical |

Critical issue:

Some intelligence outputs are:

```text
hardcoded demo metrics
```

instead of runtime-derived metrics.

---

# 8. Duplicate UI Surfaces

Observed duplication:

| Area | Duplicate Surfaces |
|---|---|
| dashboard | dashboard + reports + finance |
| inventory | products + inventory |
| customers | crm + customers |
| payments | receipts + finance payments |
| analytics | reports + intelligence |

Rule:

Only one canonical operational screen per domain.

Other screens become:

- specialized views
- filtered projections
- analytical overlays

not separate systems.

---

# 9. Canonical Mutation Rules

## Only services may mutate business truth

Screens must not:

- write stock directly
- calculate ledger directly
- mutate accounting directly
- mutate lifecycle directly

---

## Repositories only persist

Repositories must not:

- calculate business decisions
- derive KPIs
- orchestrate workflows

---

## Intelligence only derives

Intelligence layer may:

- recommend
- analyze
- predict
- classify

but never own canonical business truth.

---

# 10. Recovery Priorities

## Priority 1 — Truth Stabilization

Stabilize:

- inventory
- ledger
- sales
- repair lifecycle
- customer identity

---

## Priority 2 — Workflow Orchestration

Create:

- sale orchestrator
- repair orchestrator
- finance orchestrator
- inventory orchestrator

---

## Priority 3 — Runtime Separation

Separate:

```text
UI
runtime
services
repositories
analytics
```

---

## Priority 4 — Intelligence Legitimization

Remove:

- fake KPIs
- placeholder metrics
- hardcoded intelligence

Replace with:

runtime-derived operational intelligence.

---

# 11. Architectural Conclusion

The project is not broken.

The project evolved faster in:

```text
runtime surface area
```

than:

```text
canonical domain stabilization
```

This is recoverable.

The runtime already contains:

- operational philosophy
- business intelligence direction
- advanced repair concepts
- offline-first runtime ideas
- workspace runtime concepts

The next phase is:

```text
truth consolidation
```

not expansion.
