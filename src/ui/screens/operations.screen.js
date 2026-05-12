// src/ui/screens/operations.screen.js

import { loadSalesScreen } from "../../modules/operations/sales.screen.js";

export async function loadOperations(view) {
  if (!view) return;

  view.innerHTML = `<div id="operations-root"></div>`;

  return loadSalesScreen(document.getElementById("operations-root"));
}
