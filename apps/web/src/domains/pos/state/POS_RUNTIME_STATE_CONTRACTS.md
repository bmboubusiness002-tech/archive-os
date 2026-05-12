# POS Runtime State Contracts

## Purpose

This document defines the first state architecture contracts for the BMBOU ERP POS Runtime.

Goal:

- establish predictable runtime state
- connect runtime core with future UI
- support offline-first workflows
- prepare responsive operational interfaces
- stabilize transactional orchestration

This is the bridge between:

```txt
Runtime Core ↔ Enterprise UI
```

---

# Runtime State Philosophy

The POS runtime state must be:

```txt
predictable
reactive
transaction-safe
offline-first
framework-light
```

The state system becomes:

- the operational memory of the POS
- the synchronization bridge
- the reactive UI driver
- the analytics signal source

---

# Technology Direction

Planned runtime state engine:

```txt
Zustand
```

Reasoning:

- lightweight runtime
- low boilerplate
- predictable updates
- suitable for operational systems
- excellent for offline-first architecture

---

# Planned Runtime State Structure

Target location:

```txt
apps/web/src/domains/pos/state/
```

Planned files:

```txt
pos.store.ts
cart.store.ts
checkout.store.ts
session.store.ts
```

---

# Cart State Contract

## Responsibilities

The cart state owns:

- active cart items
- quantities
- totals
- discounts
- runtime calculations
- temporary checkout context

---

## Planned Cart State Shape

```ts
{
  items: CartItem[]
  subtotal: number
  taxes: number
  discounts: number
  total: number
  currency: string
}
```

---

# Checkout State Contract

## Responsibilities

The checkout state owns:

- payment method
- payment status
- checkout progress
- receipt payload
- validation state

---

## Planned Checkout State Shape

```ts
{
  isProcessing: boolean
  paymentMethod: string
  amountReceived: number
  changeAmount: number
  validationErrors: string[]
}
```

---

# Session State Contract

## Responsibilities

The session state owns:

- active cashier session
- branch context
- terminal state
- shift status
- runtime activity

---

## Planned Session State Shape

```ts
{
  sessionId: string
  branchId: string
  cashierId: string
  isOpen: boolean
  openedAt: string
}
```

---

# Runtime Actions

## Planned Runtime Actions

Examples:

```txt
addProduct()
removeProduct()
clearCart()
startCheckout()
completeCheckout()
openSession()
closeSession()
```

---

# Runtime Event Direction

The state layer will emit:

```txt
cart.updated
checkout.started
checkout.completed
session.opened
session.closed
```

Future destination:

```txt
packages/events
```

---

# UI Binding Strategy

The runtime state becomes the single source of truth for:

- cart sidebar
- product grid selections
- totals panel
- checkout modal
- session indicators
- offline indicators

---

# Offline Runtime Strategy

The state layer must support:

- optimistic updates
- temporary offline queues
- recovery after reconnect
- local persistence
- partial synchronization

---

# Runtime Safety Rules

## Forbidden

State layer must never:

- manipulate DOM directly
- render components
- access modal systems
- contain business calculation logic

Business rules belong to:

```txt
Domain Runtime
```

---

# First UI Milestone Enabled By This Layer

Once state contracts stabilize:

```txt
POS Workspace Preview becomes implementable
```

with:

- live cart sidebar
- instant totals
- responsive product interactions
- checkout workflow
- operational session indicators

inside:

```txt
BMBOU ERP Workspace Shell
```

---

# Immediate Next Step

Begin:

```txt
POS Workspace UI Foundation
```

and render the first modern operational POS interface.
