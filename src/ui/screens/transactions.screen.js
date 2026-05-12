// src/ui/screens/transactions.screen.js

import { renderFinanceDashboard } from "../../modules/finance/finance.dashboard.screen.js";

export async function loadTransactions(view) {
  if (!view) return;

  view.innerHTML = `<div id="finance-root"></div>`;

  return renderFinanceDashboard(document.getElementById("finance-root"));
}
