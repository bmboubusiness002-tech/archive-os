// -------------------------------------
// CUSTOMER ANALYTICS DASHBOARD (PRO)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { CustomerService } from "../../domain/customer/customer.service.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { buildCustomerState } from "../../relations/customer.engine.js";

// -------------------------------------

export async function renderCustomerAnalytics(root) {
  const db = await openDB();

  const customerService = new CustomerService();
  const ledgerRepo = new LedgerRepo();

  const customers = await customerService.getAll();
  const entries = await ledgerRepo.getAll(db);

  // -------------------------------------
  // BUILD STATES
  // -------------------------------------

  const data = customers.map(c => {
    const customerEntries = entries.filter(
      e => String(e.customerId) === String(c.id)
    );

    const state = buildCustomerState(customerEntries);

    return {
      ...c,
      ...state
    };
  });

  // -------------------------------------
  // METRICS
  // -------------------------------------

  const totalRevenue = sum(data, "totalSpent");
  const totalDebt = sum(data, "debt");

  const topCustomers = [...data]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const riskyCustomers = data.filter(c => c.debt > c.totalSpent * 0.5);

  const avgPaymentRatio =
    data.length === 0
      ? 0
      : data.reduce((s, c) => {
          const ratio = c.totalSpent > 0 ? c.totalPaid / c.totalSpent : 0;
          return s + ratio;
        }, 0) / data.length;

  // -------------------------------------
  // UI
  // -------------------------------------

  root.innerHTML = `
    <div class="analytics-container">

      <h2>🧠 Customer Analytics</h2>

      <div class="kpis">

        <div class="kpi">
          <span>Total Revenue</span>
          <b>${format(totalRevenue)}</b>
        </div>

        <div class="kpi">
          <span>Total Debt</span>
          <b class="danger">${format(totalDebt)}</b>
        </div>

        <div class="kpi">
          <span>Payment Ratio</span>
          <b>${(avgPaymentRatio * 100).toFixed(1)}%</b>
        </div>

      </div>

      <div class="section">
        <h3>🏆 Top Customers</h3>
        ${topCustomers.map(c => `
          <div class="row">
            <span>${c.name}</span>
            <b>${format(c.totalSpent)}</b>
          </div>
        `).join("")}
      </div>

      <div class="section">
        <h3>⚠ Risky Customers</h3>
        ${riskyCustomers.map(c => `
          <div class="row danger">
            <span>${c.name}</span>
            <b>${format(c.debt)}</b>
          </div>
        `).join("") || "<div>No high risk</div>"}
      </div>

      <div class="section">
        <h3>📊 Contribution</h3>
        ${data.map(c => `
          <div class="bar">
            <span>${c.name}</span>
            <div class="bar-fill" style="width:${percent(c.totalSpent, totalRevenue)}%"></div>
          </div>
        `).join("")}
      </div>

      <div class="section">
        <h3>🧠 AI Insights</h3>
        ${generateInsights(data).map(i => `
          <div class="insight">${i}</div>
        `).join("")}
      </div>

    </div>
  `;
}

// -------------------------------------

function sum(arr, key) {
  return arr.reduce((s, i) => s + (i[key] || 0), 0);
}

function percent(v, total) {
  if (!total) return 0;
  return (v / total) * 100;
}

function format(n) {
  return new Intl.NumberFormat().format(n || 0);
}

// -------------------------------------
// AI INSIGHTS (قابلة للتطوير)
// -------------------------------------

function generateInsights(data) {
  const insights = [];

  const highDebt = data.filter(c => c.debt > 100000);
  if (highDebt.length) {
    insights.push(`⚠ ${highDebt.length} customers have high debt`);
  }

  const vip = data.filter(c => c.totalSpent > 500000);
  if (vip.length) {
    insights.push(`💰 ${vip.length} VIP customers drive revenue`);
  }

  const badRatio = data.filter(c => c.totalPaid < c.totalSpent * 0.5);
  if (badRatio.length) {
    insights.push(`⚠ Low payment behavior detected`);
  }

  if (!insights.length) {
    insights.push("✔ Customer base is stable");
  }

  return insights;
}
