// -------------------------------------
// BALANCE SHEET SCREEN (FULL)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

import { buildBalanceSheet } from "../../core/accounting/balance.sheet.engine.js";

// -------------------------------------

export async function renderBalanceSheet(root) {
  const db = await openDB();
  const repo = new LedgerRepo();

  const entries = await repo.getAll(db);

  const bs = await buildBalanceSheet(entries);

  root.innerHTML = `
    <div class="balance-sheet">

      <h2>📊 Balance Sheet</h2>

      <div class="grid">

        <!-- ASSETS -->
        <div>
          <h3>Assets</h3>
          ${renderBlock(bs.assets)}
          <b>Total: ${format(bs.totalAssets)}</b>
        </div>

        <!-- LIABILITIES -->
        <div>
          <h3>Liabilities</h3>
          ${renderBlock(bs.liabilities)}
          <b>Total: ${format(bs.totalLiabilities)}</b>
        </div>

        <!-- EQUITY -->
        <div>
          <h3>Equity</h3>
          ${renderBlock(bs.equity)}
          <b>Total: ${format(bs.totalEquity)}</b>
        </div>

      </div>

      <hr/>

      <div class="check">
        ${
          bs.totalAssets === bs.totalLiabilities + bs.totalEquity
            ? "✔ Balanced"
            : "❌ Not Balanced"
        }
      </div>

    </div>
  `;
}

// -------------------------------------

function renderBlock(obj) {
  const keys = Object.keys(obj);

  if (!keys.length) return `<div>Empty</div>`;

  return keys.map(k => `
    <div class="row">
      <span>${k}</span>
      <b>${format(obj[k])}</b>
    </div>
  `).join("");
}

function format(n) {
  return new Intl.NumberFormat().format(n || 0);
}
