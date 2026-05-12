// -------------------------------------
// TRENDS SCREEN (PRO)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { buildTrends } from "../../core/accounting/trend.engine.js";

// -------------------------------------

export async function renderTrends(root) {
  const db = await openDB();
  const repo = new LedgerRepo();

  const entries = await repo.getAll(db);

  const trends = buildTrends(entries);

  root.innerHTML = `
    <div class="trends">

      <h2>📈 Business Trends</h2>

      ${trends.map(t => `
        <div class="row ${t.direction}">
          <span>${t.period}</span>
          <span>Profit: ${f(t.profit)}</span>
          <span>Growth: ${t.growth.toFixed(1)}%</span>
          <span>${emoji(t.direction)}</span>
        </div>
      `).join("")}

    </div>
  `;
}

// -------------------------------------

function f(n) {
  return new Intl.NumberFormat().format(n || 0);
}

function emoji(dir) {
  if (dir === "UP") return "📈";
  if (dir === "DOWN") return "📉";
  return "➖";
}
