import { buildCustomerState } from "../../relations/customer.engine.js";
import { analyzeCustomer } from "../../intelligence/customer/customer.intelligence.js";

export function renderCustomerProfile(view, customer, entries) {
  const state = buildCustomerState(entries);
  const signals = analyzeCustomer(state);

  view.innerHTML = `
    <h2>👤 ${customer.name}</h2>

    <div>Total Spent: ${state.totalSpent}</div>
    <div>Total Paid: ${state.totalPaid}</div>
    <div>Debt: ${state.debt}</div>
    <div>Status: ${state.status}</div>

    <hr/>

    <div>
      ${signals.map(s => `<div>${s}</div>`).join("")}
    </div>
  `;
}
