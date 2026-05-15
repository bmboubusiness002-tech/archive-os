# POS Runtime Analysis

## Scope

This analysis targets the operational POS runtime.

Primary files:

- src/modules/pos/pos.screen.js
- src/modules/pos/cart.engine.js
- src/modules/pos/payment.flow.js
- src/modules/pos/pos.controller.js
- src/modules/pos/pos.flow.js
- src/modules/pos/pos.events.js
- src/modules/pos/pos.db.js

Goal:

Understand the canonical operational sales runtime.

---

# 1. POS Runtime Purpose

The POS runtime is the transactional heart of the ERP.

It currently handles:

- product browsing
- cart manipulation
- quantity updates
- checkout execution
- receipt generation
- stock deduction
- payment capture
- sales persistence
- realtime feedback

Architecturally:

POS is the most operationally critical runtime.

---

# 2. pos.screen.js Analysis

Current role:

```text
screen + controller + orchestrator + renderer
```

inside one file.

Responsibilities currently mixed together:

| Responsibility | Present |
|---|---|
| DOM rendering | yes |
| cart state | yes |
| checkout orchestration | yes |
| notifications | yes |
| product rendering | yes |
| quantity mutation | yes |
| stock update | partial |
| persistence calls | yes |
| UI lifecycle | yes |

This is the primary architectural overload.

---

# 3. Cart State Analysis

Current cart model:

```text
cart[]
```

containing:

- product id
- quantity
- price
- subtotal

Observed behavior:

- in-memory mutable
- screen-owned
- directly mutated by UI actions

Example runtime behavior:

```text
+ button
→ mutate quantity
→ rerender cart
→ rerender totals
```

This works operationally.

But:

there is no isolated cart state engine.

---

# 4. Checkout Flow Analysis

Current checkout flow:

```text
checkout click
→ gather cart
→ persist sale
→ update inventory
→ clear cart
→ rerender UI
→ show toast
```

Operationally functional.

But architecturally fragile.

---

# 5. Critical Runtime Failure

Observed production failure:

```text
Cannot set properties of null
```

inside:

```text
renderGrid()
showToast()
```

Root cause:

checkout mutates DOM after runtime remount.

Meaning:

```text
render lifecycle is not isolated
```

---

# 6. POS Architectural Violations

## 6.1 Screen Owns Business Logic

Current:

```text
screen controls sales lifecycle
```

Correct target:

```text
sale service orchestrates
screen observes
```

---

## 6.2 Screen Mutates Runtime State

Current:

```text
screen mutates cart directly
```

Correct target:

```text
cart engine owns state
```

---

## 6.3 Screen Controls Persistence

Current:

```text
screen calls repositories
```

Correct target:

```text
service layer controls persistence
```

---

# 7. Existing Strengths

Despite architectural mixing,

POS already contains:

- operational sales workflow
- transactional lifecycle
- realtime operational feedback
- cart semantics
- receipt concepts
- offline-first behavior
- inventory linkage

This is not fake scaffolding.

It is a real runtime.

---

# 8. Existing Runtime Assets

## cart.engine.js

Potential canonical cart owner.

Should become:

```text
single source of cart truth
```

---

## payment.flow.js

Potential canonical payment orchestration.

Should own:

- payment validation
- payment lifecycle
- receipt trigger
- transaction completion

---

## pos.controller.js

Potential runtime coordination layer.

Should orchestrate:

- UI
- services
- events
- runtime lifecycle

---

## pos.events.js

Potential canonical POS event stream.

Should emit:

- sale.completed
- cart.updated
- checkout.started
- payment.completed
- inventory.deducted

---

# 9. Current Data Flow

Current runtime flow:

```text
UI click
→ screen mutation
→ repository
→ rerender
```

Target flow:

```text
UI action
→ controller
→ service
→ event bus
→ repositories
→ projections
→ runtime refresh
```

---

# 10. Duplicate Responsibilities

Observed duplication:

| Responsibility | Duplicate Location |
|---|---|
| totals | screen + finance |
| stock deduction | pos + inventory |
| receipts | receipts module + pos |
| customer linkage | crm + sales |
| reporting | reports + finance |

Canonical ownership must be enforced.

---

# 11. POS Runtime Health

| Layer | Status |
|---|---|
| cart operations | operational |
| checkout | operational but fragile |
| rendering | fragile |
| lifecycle isolation | weak |
| eventing | partial |
| orchestration | mixed |
| persistence | operational |
| stock linkage | partial |
| accounting linkage | partial |

---

# 12. Immediate Recovery Priorities

## Priority 1

Extract:

```text
cart state ownership
```

out of screens.

---

## Priority 2

Protect render lifecycle:

- mount guards
- DOM existence validation
- runtime isolation

---

## Priority 3

Create:

```text
Sale Orchestrator
```

for:

- checkout
- inventory
- ledger
- receipts
- analytics

---

## Priority 4

Replace:

```text
screen-driven persistence
```

with:

```text
service-driven persistence
```

---

# 13. Business Interpretation

The POS runtime already models the real business correctly:

- buy inventory
- sell products
- manage margin
- deduct stock
- track cashflow
- support discounts
- maintain transactional continuity

The issue is not business logic.

The issue is:

```text
runtime responsibility fragmentation
```

---

# 14. Final Conclusion

The POS runtime is:

```text
operationally real
architecturally overloaded
```

This is recoverable.

The correct path is:

```text
stabilize
→ isolate
→ orchestrate
→ consolidate
```

not rewrite.
