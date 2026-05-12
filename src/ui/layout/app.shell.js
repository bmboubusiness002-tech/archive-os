// src/ui/layout/app.shell.js

import { renderLayout } from "./layout.engine.js";
import { renderSidebar } from "./sidebar.js";

export function startCockpit() {
  const root = document.getElementById("app");

  root.innerHTML = `
    <div class="app-shell">
      <aside id="sidebar" class="sidebar"></aside>
      <main class="main">
        <div class="topbar">
          <div id="screen-title">Dashboard</div>
          <div class="status-pill">● READY</div>
        </div>
        <div id="view" class="view"></div>
      </main>
    </div>
  `;

  renderSidebar(document.getElementById("sidebar"));
  const initial = window.location.pathname && window.location.pathname !== "/"
    ? window.location.pathname : "/";
  try { renderLayout(initial); } catch (err) { console.warn("initial render failed:", err); }
}
