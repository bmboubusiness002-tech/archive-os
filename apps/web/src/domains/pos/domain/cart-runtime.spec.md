# Cart Runtime Extraction Specification

## Purpose

The Cart Runtime is the first true operational kernel extracted from the legacy POS system.

This runtime becomes the foundation for:

- checkout
- pricing
- receipts
- payments
- session state
- analytics
- inventory synchronization

The cart runtime must become:

```txt
framework-independent
UI-independent
predictable
transaction-safe
```

---

# Legacy Source

Current source logic:

```txt
legacy/local-dexie-pos-src/modules/pos/pos.flow.js
```

Observed runtime:

```js
cart.items
cart.total
addProduct()
reset()
```

---

# Extraction Goals

## Preserve

Preserve:

- cart totals
- quantity calculations
- product aggregation
- transactional consistency
- operational simplicity

---

## Remove

Remove:

- modal orchestration
- rendering assumptions
- UI coupling
- mutable global behavior

---

# Future Runtime Design

Target location:

```txt
apps/web/src/domains/pos/domain/
```

Planned files:

```txt
cart.entity.ts
cart-item.entity.ts
cart-total.service.ts
pricing.service.ts
```

---

# Cart Entity Responsibilities

## Core Operations

Required operations:

```txt
addProduct
removeProduct
increaseQuantity
decreaseQuantity
clearCart
calculateTotals
applyDiscount
```

---

# Cart Runtime Contracts

## Product Input Contract

Minimum required product structure:

```ts
{
  id: string
  name: string
  price: number
}
```

---

## Cart Item Structure

Planned runtime structure:

```ts
{
  productId: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}
```

---

# Totals Runtime

The totals runtime must support:

- subtotal
- taxes
- discounts
- service fees
- future promotions
- multi-currency expansion

---

# State Direction

Planned runtime state:

```txt
apps/web/src/domains/pos/state/
```

Technology direction:

```txt
Zustand
```

Reason:

- lightweight
- operationally predictable
- minimal runtime overhead
- suitable for offline-first workflows

---

# Runtime Safety Rules

## Forbidden

The cart runtime must never:

- import React
- import DOM APIs
- invoke modals
- mutate UI state directly
- access rendering systems

---

# Runtime Event Direction

Planned runtime events:

```txt
cart.updated
cart.cleared
cart.item.added
cart.item.removed
checkout.started
```

Future destination:

```txt
packages/events
```

---

# UX Implications

The extracted cart runtime enables:

- responsive live cart sidebar
- real-time totals
- instant recalculation
- optimistic UI
- touch-friendly POS workflows
- adaptive enterprise layouts

---

# First Visible UI Milestone

Once cart runtime extraction stabilizes:

```txt
POS Workspace Preview becomes renderable
```

with:

- product grid
- live cart
- dynamic totals
- checkout panel
- session header

inside:

```txt
BMBOU ERP Workspace Shell
```

---

# Immediate Next Step

Create:

```txt
POS Runtime State Contracts
```

before implementing the first visible operational UI.
