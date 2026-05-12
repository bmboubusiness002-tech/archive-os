// -------------------------------------
// JOURNAL ENTRY UI (DOUBLE ENTRY)
// -------------------------------------

import { openDB, withTransaction } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

export function renderJournalEntry(root) {
  root.innerHTML = `
    <div class="journal">

      <h2>🧾 Journal Entry</h2>

      <div id="lines"></div>

      <button id="add-line">+ Line</button>

      <hr/>

      <button id="save">Save Entry</button>

    </div>
  `;

  const linesEl = root.querySelector("#lines");

  let lines = [];

  function renderLines() {
    linesEl.innerHTML = lines.map((l, i) => `
      <div class="line">
        <input data-i="${i}" class="account" placeholder="Account" />
        <input data-i="${i}" class="debit" placeholder="Debit" />
        <input data-i="${i}" class="credit" placeholder="Credit" />
      </div>
    `).join("");
  }

  root.querySelector("#add-line").onclick = () => {
    lines.push({});
    renderLines();
  };

  root.querySelector("#save").onclick = async () => {
    const inputs = root.querySelectorAll(".line");

    const entries = [];
    let debitTotal = 0;
    let creditTotal = 0;

    inputs.forEach(row => {
      const account = row.querySelector(".account").value;
      const debit = Number(row.querySelector(".debit").value || 0);
      const credit = Number(row.querySelector(".credit").value || 0);

      if (debit > 0) debitTotal += debit;
      if (credit > 0) creditTotal += credit;

      entries.push({
        id: crypto.randomUUID(),
        debitAccount: debit > 0 ? account : null,
        creditAccount: credit > 0 ? account : null,
        amount: debit || credit,
        createdAt: Date.now()
      });
    });

    if (debitTotal !== creditTotal) {
      alert("❌ Entry not balanced");
      return;
    }

    const db = await openDB();
    const repo = new LedgerRepo();

    await withTransaction(db, ["ledger_entries"], (tx) => {
      repo.bulkPut(tx, entries);
    });

    alert("✅ Entry saved");
  };

  renderLines();
}
