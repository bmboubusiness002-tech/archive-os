// -------------------------------------
// CUSTOMERS SCREEN (V2 PRO + REALTIME)
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { CustomerService } from "../../domain/customer/customer.service.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";

import { buildCustomerState } from "../../relations/customer.engine.js";
import { analyzeCustomer } from "../../intelligence/customer/customer.intelligence.js";

import { renderCustomerProfile } from "./customer.profile.screen.js";
import { openPaymentModal } from "../../ui/modals/payment.modal.js";

// 🔥 NEW
import { registerScreen } from "../../core/realtime/realtime.engine.js";

let mounted = false;

// -------------------------------------

export async function renderCustomers(root) {
  if (!mounted) {
    registerScreen(() => renderCustomers(root));
    mounted = true;
  }

  const db = await openDB();

  const service = new CustomerService();
  const ledgerRepo = new LedgerRepo();

  const customers = await service.getAll();
  const entries = await ledgerRepo.getAll(db);

  let enriched = customers.map(c => {
    const customerEntries = entries.filter(
      e => String(e.customerId) === String(c.id)
    );

    const state = buildCustomerState(customerEntries);
    const signals = analyzeCustomer(state);

    return {
      ...c,
      ...state,
      signals
    };
  });

  root.innerHTML = `
    <div class="customers-container">
      <h2>👥 Customers Intelligence</h2>
      <div id="customers-grid"></div>
    </div>
  `;

  const grid = root.querySelector("#customers-grid");

  grid.innerHTML = enriched.map(c => `
    <div class="customer-card">
      <div>${c.name}</div>
      <div>Spent: ${format(c.totalSpent)}</div>
      <div>Debt: ${format(c.debt)}</div>

      <button data-view="${c.id}">Profile</button>
      <button data-pay="${c.id}" ${c.debt <= 0 ? "disabled" : ""}>Pay</button>
    </div>
  `).join("");

  grid.querySelectorAll("[data-view]").forEach(btn => {
    btn.onclick = () => {
      const c = enriched.find(x => x.id === btn.dataset.view);
      renderCustomerProfile(root, c);
    };
  });

  grid.querySelectorAll("[data-pay]").forEach(btn => {
    btn.onclick = () => {
      const c = enriched.find(x => x.id === btn.dataset.pay);
      openPaymentModal(c, c.debt);
    };
  });
}

// -------------------------------------

function format(n) {
  return new Intl.NumberFormat().format(n || 0);
}
