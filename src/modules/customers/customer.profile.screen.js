// -------------------------------------
// CUSTOMER PROFILE (PRO)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import { buildCustomerState } from "../../relations/customer.engine.js";
import { analyzeCustomer } from "../../intelligence/customer/customer.intelligence.js";
import { createCustomerPayment } from "../../transactions/payment.tx.js";

export async function renderCustomerProfile(view, customer) {
  const db = await openDB();
  const ledgerRepo = new LedgerRepo();

  const entries = await ledgerRepo.getAll(db);

  const customerEntries = entries.filter(
    e => String(e.customerId) === String(customer.id)
  );

  const state = buildCustomerState(customerEntries);
  const signals = analyzeCustomer(state);

  view.innerHTML = `
    <div class="customer-profile">

      <h2>👤 ${customer.name}</h2>

      <div class="stats">
        <div>💰 Spent: ${state.totalSpent}</div>
        <div>💵 Paid: ${state.totalPaid}</div>
        <div>⚠ Debt: ${state.debt}</div>
        <div>📊 Status: ${state.status}</div>
      </div>

      <div class="signals">
        ${signals.map(s => `<div>${s}</div>`).join("")}
      </div>

      <button id="pay-debt">💳 Pay Debt</button>

      <hr/>

      <h3>🧾 Timeline</h3>

      <div class="timeline">
        ${customerEntries.map(e => `
          <div class="entry">
            <div>${e.type || "ENTRY"}</div>
            <div>${e.amount}</div>
            <div>${new Date(e.createdAt).toLocaleString()}</div>
          </div>
        `).join("")}
      </div>

    </div>
  `;

  // 🔥 PAYMENT BUTTON
  view.querySelector("#pay-debt").onclick = () => {
    openPaymentModal(customer, state.debt);
  };
}
