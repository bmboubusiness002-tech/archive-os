// -------------------------------------
// GLOBAL DASHBOARD (COMMAND CENTER + REALTIME)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { CustomerService } from "../../domain/customer/customer.service.js";
import { ProductService } from "../../domain/product/product.service.js";
import { StockBalanceRepo } from "../../domain/stock/stock.balance.repo.js";

import { buildCustomerState } from "../../relations/customer.engine.js";

// 🔥 NEW
import { registerScreen } from "../../core/realtime/realtime.engine.js";

let mounted = false;

// -------------------------------------

export async function renderDashboard(root) {
  // 🔥 prevent duplicate subscriptions
  if (!mounted) {
    registerScreen(() => renderDashboard(root));
    mounted = true;
  }

  const db = await openDB();

  const ledgerRepo = new LedgerRepo();
  const customerService = new CustomerService();
  const productService = new ProductService();
  const stockRepo = new StockBalanceRepo();

  const entries = await ledgerRepo.getAll(db);
  const customers = await customerService.getAll();
  const products = await productService.getAll();
  const stockMap = await stockRepo.getAllMap(db);

  // -------------------------------------
  // FINANCIAL
  // -------------------------------------

  let revenue = 0;
  let cogs = 0;
  let cashIn = 0;
  let cashOut = 0;

  for (const e of entries) {
    const amount = Number(e.amount) || 0;

    if (e.creditAccount === "revenue") revenue += amount;
    if (e.debitAccount === "cogs") cogs += amount;

    if (e.debitAccount === "cash") cashIn += amount;
    if (e.creditAccount === "cash") cashOut += amount;
  }

  const profit = revenue - cogs;
  const cash = cashIn - cashOut;

  // -------------------------------------
  // CUSTOMERS
  // -------------------------------------

  const customerStates = customers.map(c => {
    const ce = entries.filter(e => String(e.customerId) === String(c.id));
    return {
      ...c,
      ...buildCustomerState(ce)
    };
  });

  const totalDebt = sum(customerStates, "debt");

  const topCustomer =
    [...customerStates].sort((a, b) => b.totalSpent - a.totalSpent)[0];

  // -------------------------------------
  // INVENTORY
  // -------------------------------------

  const stockList = products.map(p => ({
    ...p,
    qty: stockMap[p.id] || 0
  }));

  const lowStock = stockList.filter(p => p.qty <= 2);

  const inventoryValue = stockList.reduce(
    (s, p) => s + p.qty * (p.cost_price || 0),
    0
  );

  // -------------------------------------
  // SIGNALS
  // -------------------------------------

  const signals = [];

  if (cash < 0) signals.push("⚠ Negative cash flow");
  if (profit < 0) signals.push("❌ Losing money");
  if (totalDebt > revenue * 0.4)
    signals.push("⚠ High customer debt");

  if (lowStock.length > 0)
    signals.push(`📦 ${lowStock.length} products low stock`);

  if (!signals.length) signals.push("✔ System stable");

  // -------------------------------------
  // UI
  // -------------------------------------

  root.innerHTML = `
    <div class="dashboard">

      <h2>🏠 Command Center</h2>

      <div class="kpis">
        <div class="card">
          <span>Revenue</span>
          <b>${format(revenue)}</b>
        </div>

        <div class="card">
          <span>Profit</span>
          <b>${format(profit)}</b>
        </div>

        <div class="card">
          <span>Cash</span>
          <b>${format(cash)}</b>
        </div>

        <div class="card">
          <span>Inventory Value</span>
          <b>${format(inventoryValue)}</b>
        </div>
      </div>

      <div class="section">
        <h3>🧠 Signals</h3>
        ${signals.map(s => `<div class="signal">${s}</div>`).join("")}
      </div>

      <div class="section">
        <h3>👤 Top Customer</h3>
        ${
          topCustomer
            ? `<div>${topCustomer.name} — ${format(topCustomer.totalSpent)}</div>`
            : "No data"
        }
      </div>

      <div class="section">
        <h3>📦 Low Stock</h3>
        ${
          lowStock.length
            ? lowStock.map(p => `<div>${p.name} (${p.qty})</div>`).join("")
            : "All good"
        }
      </div>

    </div>
  `;
}

// -------------------------------------

function sum(arr, key) {
  return arr.reduce((s, i) => s + (i[key] || 0), 0);
}

function format(n) {
  return new Intl.NumberFormat().format(n || 0);
}
