# Canonical Domain Map

## Objective

This document defines the real business architecture of `archive-os`.

Its purpose is to establish:

- canonical business domains
- ownership boundaries
- transactional truth
- workflow relations
- operational dependencies
- future stabilization rules

---

# 1. Core Business Philosophy

The business is not only selling products.

The business operates through:

```text
capital
→ inventory
→ operations
→ customer interaction
→ sales or repair
→ cashflow
→ profit/loss
→ reinvestment
→ growth decisions
```

The ERP runtime exists to model this operational loop continuously.

---

# 2. Canonical Domains

## 2.1 Partner Capital Domain

Responsible for:

- capital injection
- ownership participation
- profit sharing
- reinvestment logic
- operational contribution tracking

### Main Concepts

| Entity | Purpose |
|---|---|
| Partner | owner or operational stakeholder |
| Capital Injection | money or assets introduced |
| Profit Distribution | monthly or periodic sharing |
| Reserve Allocation | emergency or growth reserve |

---

## 2.2 Inventory Domain

Responsible for:

- products
- stock movement
- purchasing
- stock valuation
- warehouse state
- parts inventory

### Canonical Truth

Stock is event-derived.

### Formula

```text
opening
+ purchases
+ returns in
- sales
- repair consumption
- wastage
= current stock
```

### Main Entities

| Entity | Purpose |
|---|---|
| Product | commercial or repair item |
| Category | grouping structure |
| Stock Movement | immutable movement log |
| Supplier | source of products |
| Purchase | inventory acquisition |

---

## 2.3 Sales Domain

Responsible for:

- customer sales
- quotations
- invoices
- discounts
- payment collection
- revenue tracking

### Canonical Rules

A sale must:

1. reduce stock
2. create financial movement
3. create ledger trace
4. generate operational analytics

### Main Entities

| Entity | Purpose |
|---|---|
| Sale | commercial transaction |
| Sale Line | product movement |
| Invoice | financial representation |
| Payment | collected money |
| Discount | negotiated adjustment |

---

## 2.4 Repair Domain

Responsible for:

- diagnostics
- device intake
- technician workflow
- spare part usage
- repair billing
- repair lifecycle

This is one of the strategic differentiators of the system.

### Canonical Lifecycle

```text
received
→ diagnosing
→ awaiting parts
→ repairing
→ testing
→ ready
→ delivered
```

### Main Entities

| Entity | Purpose |
|---|---|
| Repair Ticket | repair workflow root |
| Device | customer hardware |
| Diagnostic | technical assessment |
| Repair Part | consumed inventory |
| Technician Task | labor operation |
| Repair Invoice | customer billing |

---

# 3. Finance Domain

Responsible for:

- cashflow
- expenses
- ledger entries
- recurring obligations
- profitability
- reporting

### Canonical Profit Logic

```text
profit
= revenue
- inventory cost
- repair part cost
- operating expenses
- payroll
- recurring obligations
```

### Main Entities

| Entity | Purpose |
|---|---|
| Ledger Entry | accounting trace |
| Expense | operational outflow |
| Cash Movement | liquidity movement |
| Account | financial grouping |
| Balance Snapshot | reporting state |

---

# 4. CRM and Customer Domain

Responsible for:

- customer identity
- purchase history
- repair history
- segmentation
- customer behavior
- customer intelligence

### Main Entities

| Entity | Purpose |
|---|---|
| Customer | business actor |
| Customer Profile | behavioral context |
| Interaction | CRM activity |
| Segment | classification |
| Recommendation | intelligence output |

---

# 5. Intelligence Domain

Responsible for:

- operational analysis
- predictive signals
- pricing recommendations
- inventory insights
- customer patterns
- strategic recommendations

Important:

This is not generic AI.

This is:

```text
business operational intelligence
```

built from runtime data.

### Existing Engines

| Engine | Purpose |
|---|---|
| pricing | smart pricing |
| margin | profitability analysis |
| negotiation | dynamic selling logic |
| cashflow | liquidity insight |
| inventory | movement and stagnation analysis |
| customer | behavioral analysis |

---

# 6. Runtime Domain

Responsible for:

- workspace shell
- navigation
- telemetry
- recovery
- runtime diagnostics
- state management
- dependency orchestration

### Current Runtime Direction

The runtime is evolving toward:

```text
ERP Operating Workspace
```

not a simple page router.

---

# 7. Canonical Transaction Flow

## Product Sale

```text
customer action
→ cart
→ sale validation
→ stock deduction
→ ledger entry
→ payment registration
→ analytics update
→ intelligence signals
```

---

## Repair Workflow

```text
customer intake
→ diagnostic
→ supplier part acquisition
→ repair execution
→ billing
→ payment
→ profitability analysis
```

---

## Purchase Workflow

```text
supplier order
→ stock reception
→ inventory valuation
→ payable tracking
→ stock availability
→ pricing recalculation
```

---

# 8. Ownership Map

| Domain | Owns Truth |
|---|---|
| inventory | stock movement |
| finance | ledger and cash |
| repair | repair lifecycle |
| sales | transaction execution |
| CRM | customer state |
| runtime | UI/runtime orchestration |
| intelligence | derived recommendations only |

Important:

The intelligence layer must never directly mutate business truth.

---

# 9. Critical Stabilization Rules

## Rule 1

UI screens cannot become business truth.

---

## Rule 2

Every transaction must become traceable.

---

## Rule 3

Inventory and finance must remain reconcilable.

---

## Rule 4

Repair parts must reduce inventory automatically.

---

## Rule 5

Every important business event should eventually become event-driven.

---

# 10. Long-Term Architecture Goal

Target architecture:

```text
Offline-first
Event-driven
Operational Intelligence ERP Runtime
```

Specialized for:

- GSM shops
- informatique stores
- repair centers
- hybrid retail/service businesses
