# Inventory Core Analysis

## Scope

This analysis targets the canonical inventory truth layer.

Primary files:

- src/domain/product/product.repo.js
- src/domain/stock/stock.balance.repo.js
- src/domain/stock/stock.balance.service.js

Goal:

Identify:

- inventory truth ownership
- stock mutation flow
- inventory calculation logic
- sales linkage
- repair linkage
- reporting linkage
- duplication risks
- runtime integrity risks

---

# 1. Inventory Role Inside archive-os

Inventory is not a simple product catalog.

Inside archive-os:

inventory is the financial-operational backbone.

Because inventory affects:

- sales
- repair
- purchasing
- supplier flow
- margin
- cashflow
- accounting
- forecasting
- negotiation intelligence
- analytics
- investment decisions

Meaning:

```text
inventory = operational capital representation
```

not merely stock quantities.

---

# 2. product.repo.js Analysis

Current role:

```text
product persistence repository
```

Observed responsibilities:

| Responsibility | Status |
|---|---|
| product storage | active |
| product retrieval | active |
| category handling | partial |
| filtering | partial |
| pricing storage | active |
| inventory linkage | indirect |
| analytics metadata | weak |

---

# 3. Product Model Interpretation

Products currently behave as:

```text
commercial inventory units
```

not merely database entities.

A product implicitly contains:

- acquisition cost
- market price
- margin opportunity
- movement velocity
- inventory exposure
- supplier dependency
- lifecycle behavior

But:

most of this is not normalized yet.

---

# 4. Core Architectural Problem

Currently:

```text
product truth is fragmented
```

between:

- product.repo
- stock services
- sales flow
- repair flow
- analytics
- intelligence

This creates:

- duplicated totals
- inconsistent stock values
- stale inventory metrics
- unreliable forecasting

---

# 5. stock.balance.repo.js Analysis

This file is extremely important.

It represents:

```text
inventory state persistence
```

not merely inventory display.

Observed role:

| Responsibility | Status |
|---|---|
| quantity tracking | active |
| stock retrieval | active |
| stock update | active |
| balance persistence | active |
| movement history | weak |
| audit traceability | partial |
| valuation logic | weak |

---

# 6. Canonical Inventory Truth

The biggest architectural question:

```text
What is the source of truth?
```

Current answer is unclear.

Possibilities currently mixed:

- products
- balances
- sales deductions
- repair consumption
- manual mutations

This is dangerous.

---

# 7. Correct Inventory Model

Canonical model should be:

```text
Product
 +
Inventory Ledger
 +
Stock Balances
 +
Movement Events
```

Where:

## Product
stores:

- identity
- category
- commercial metadata

## Inventory Ledger
stores:

- every movement
- every deduction
- every acquisition
- every correction

## Stock Balance
stores:

- current projection only

Meaning:

```text
balance = derived state
```

not canonical truth.

---

# 8. stock.balance.service.js Analysis

Current role:

```text
inventory orchestration layer
```

Potentially one of the most important services.

Observed responsibilities:

| Responsibility | Status |
|---|---|
| stock mutation | active |
| balance calculation | active |
| persistence coordination | active |
| inventory lookup | active |
| transactional safety | weak |
| auditability | weak |
| event emission | partial |

---

# 9. Current Inventory Flow

Current runtime flow:

```text
sale
→ stock deduction
→ balance update
→ rerender
```

But:

there is no canonical inventory transaction layer.

Meaning:

multiple modules may mutate inventory independently.

---

# 10. Major Inventory Risks

## 10.1 Silent Desynchronization

Possible today:

```text
sales stock != displayed stock
```

because:

multiple mutation paths exist.

---

## 10.2 Repair Consumption Risk

Repair modules may consume:

- spare parts
- accessories
- screens
- batteries

without unified movement registration.

This can corrupt:

- profitability
- availability
- procurement planning

---

## 10.3 Margin Distortion

If inventory cost basis changes inconsistently:

then:

- ROI
- margins
- profitability
- intelligence recommendations

all become unreliable.

---

# 11. Existing Strengths

The current inventory runtime already contains:

- real stock semantics
- operational inventory flow
- sales linkage
- product lifecycle direction
- purchasing concepts
- balance persistence

This is a strong foundation.

---

# 12. Missing Critical Layers

The following layers are still missing:

## Inventory Ledger

Required for:

- movement traceability
- auditability
- rollback
- reconciliation

---

## Movement Events

Required events:

```text
inventory.received
inventory.deducted
inventory.adjusted
inventory.transferred
inventory.consumed
```

---

## Cost Basis Engine

Needed for:

- weighted average
- FIFO/LIFO support
- margin truth
- profitability truth

---

## Procurement Intelligence

Needed for:

- slow moving stock
- dead inventory
- reorder forecasting
- supplier dependence

---

# 13. Runtime Ownership Problems

Current ownership is unclear.

Inventory logic is partially duplicated between:

| Area | Problem |
|---|---|
| POS | stock deduction |
| Repair | parts consumption |
| Purchase | stock injection |
| Finance | valuation |
| Intelligence | forecasting |

All should pass through:

```text
Inventory Runtime Service
```

---

# 14. Business Interpretation

Your business model depends heavily on:

```text
inventory velocity
margin intelligence
cashflow circulation
```

Meaning:

inventory is not passive storage.

It is:

```text
capital circulation engine
```

This aligns strongly with the philosophy behind archive-os.

---

# 15. Inventory Runtime Health

| Layer | Status |
|---|---|
| product storage | operational |
| balance tracking | operational |
| stock deduction | partial |
| valuation | weak |
| movement history | weak |
| inventory audit | weak |
| procurement intelligence | partial |
| transactional integrity | fragile |

---

# 16. Recovery Priorities

## Priority 1

Establish:

```text
canonical inventory owner
```

---

## Priority 2

Introduce:

```text
inventory movement ledger
```

---

## Priority 3

Force all modules through:

```text
inventory service orchestration
```

No direct mutations.

---

## Priority 4

Introduce:

```text
inventory event stream
```

for analytics and intelligence.

---

# 17. Final Conclusion

Inventory inside archive-os is:

```text
conceptually advanced
operationally functional
architecturally fragmented
```

The philosophy is extremely strong.

The missing piece is:

```text
canonical inventory transaction orchestration
```

Once stabilized,

inventory becomes:

```text
the financial nervous system of the ERP
```
