# archive-os — Canonical System Guide

## 1. System Identity

`archive-os` is the final product repository for a hybrid retail, repair, inventory, finance, partnership, and operational intelligence system.

It is not a simple POS. It is an **Operational Intelligence ERP Runtime** for a micro-informatics and GSM shop where selling, buying, repair services, cash movement, stock movement, partner capital, expenses, and decisions must be recorded and understood together.

## 2. Business Mission

The system exists to answer these questions:

- What do we own now?
- What did we buy, from whom, at what cost, and why?
- What did we sell, at what margin, and with what discount?
- What repair jobs are open, awaiting parts, diagnosing, repairing, ready, or delivered?
- How much cash entered and left the shop?
- What is real profit after COGS, parts, rent, electricity, internet, salaries, and other operating expenses?
- How much capital has been recovered?
- What should be bought, discounted, stopped, promoted, repaired, or reinvested in?

## 3. Canonical Business Lines

### 3.1 Retail Product Sales

Purchase products from suppliers, enter them into inventory, price them using cost plus margin and market logic, sell them to customers, reduce stock, record revenue, and calculate margin.

### 3.2 Repair Services

Receive device, diagnose, request or consume parts, assign technician work, calculate customer price, collect payment, and measure service profit.

### 3.3 Partnership and Capital Cycle

One partner provides capital and physical setup. The other manages operations, planning, systems, customer experience, and recovery/growth. Profit is calculated after costs and then distributed according to agreement.

## 4. Architectural Principle

The core rule:

```text
Truth = Business Events + Stock Movements + Ledger Entries
```

The UI is not truth. A displayed balance is not truth by itself. The database is not enough by itself. Every important number must be explainable from recorded events.

## 5. Current Runtime Structure

The repository currently contains these major layers:

```text
src/
├── app/                application boot, seed, usecases
├── core/               accounting, audit, backup, control, realtime, safe-dom
├── domain/             business repositories, models, services
├── events/             event stream and event-bus layers
├── infra/              IndexedDB infrastructure
├── intelligence/       pricing, finance, customer, negotiation, margin engines
├── modules/            POS, sales, purchase, repair, inventory, finance, HR, reports, admin screens
├── runtime/            registry, telemetry, audit, recovery, state, workspace shell
├── transactions/       transactional operations
└── ui/                 layout, sidebar, modals, components, styles, legacy screens
```

## 6. Canonical Module Map

### Operations

- POS / Start Sale
- POS Sessions
- POS Returns
- Sales History
- Invoices
- Quotations
- Payments
- Repair Tickets
- Repair Diagnostics
- Repair Parts
- Repair Billing
- Customer Tracking
- Technician Board

### Inventory

- Product Catalog
- Stock Balance
- Warehouses
- Stock Movements
- Smart Pricing
- Spare Parts
- Serial / IMEI lookup

### Purchase and Supply

- Purchase Orders
- Suppliers
- Purchase Returns
- Supplier scoring and supplier intelligence are target capabilities.

### Finance

- Finance Dashboard
- Expenses
- Cash / Bank
- Installments
- Journal Entries
- Chart of Accounts
- Receipts
- Financial Reports

### Customers and CRM

- Customers
- Add Customer
- Customer CRM
- Credit & Pay
- Customer Intelligence

### Intelligence

- Dashboard signals
- Predictive Analytics
- Strategy Advisor
- Scenario Simulation
- Pricing intelligence
- Inventory intelligence
- Financial intelligence
- Customer intelligence

### System and Admin

- Users
- Roles
- Branches
- Templates
- Settings
- Privacy
- Terms
- Runtime audits and recovery diagnostics

## 7. Runtime Observability Added

The system now includes runtime observability and recovery surfaces:

- Runtime telemetry
- Runtime diagnostics
- Dependency graph
- Recovery scanner
- Workflow transaction audit
- Business integrity audit
- Recovery backlog generator
- Runtime recovery map
- Safe DOM utilities

These layers must remain observational and defensive. They should not silently mutate business data.

## 8. Known Architectural Risks

- Two data layers currently coexist: `src/infra/db/db.js` and `src/modules/pos/pos.db.js`.
- Some legacy usecases, especially `createSale.js`, contain old import paths and must be rehabilitated carefully.
- Several screens are reachable but may still be placeholders or partial implementations.
- Some modules are UI-first and not yet connected to canonical domain workflows.
- There are duplicate event-bus concepts that must later be unified through a compatibility adapter.

## 9. Stabilization Rule

Before adding new features, every module must be classified as:

```text
live | partial | placeholder | duplicated | broken | disposable | canonical
```

No module should be deleted until its role is mapped and its replacement is confirmed.

## 10. Product Direction

The product direction is:

```text
Retail + Repair + Inventory + Finance + Partnership + Intelligence
```

The system should remain lightweight, browser-first, offline-capable, and understandable. The target is not to imitate large ERP systems blindly, but to preserve the shop-specific operational intelligence philosophy and make it usable, stable, and commercially deployable.
