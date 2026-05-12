// src/ui/screens/dashboard.screen.js

import { renderDashboard } from "../../modules/dashboard/dashboard.screen.js";

export async function loadDashboard(view) {
  if (!view) return;

  view.innerHTML = `<div id="dashboard-root"></div>`;

  return renderDashboard(document.getElementById("dashboard-root"));
}