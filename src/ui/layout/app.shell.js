// src/ui/layout/app.shell.js

import { renderLayout } from "./layout.engine.js";
import { renderSidebar } from "./sidebar.js";

import {
  renderWorkspaceDock,
  renderWorkspaceContext,
  renderRuntimeNotifications,
  bindWorkspaceShell
} from "../../runtime/workspace/workspace.shell.js";

export function startCockpit() {
  const root = document.getElementById("app");

  root.innerHTML = `
    <div class="app-shell">
      <aside id="sidebar" class="sidebar"></aside>

      <main class="main">
        <div class="topbar">
          <div class="topbar-left">
            <div id="screen-title">Dashboard</div>
            <div id="workspace-dock" class="workspace-dock"></div>
          </div>

          <div class="topbar-right">
            <div id="workspace-context" class="workspace-context"></div>
            <div class="status-pill">● READY</div>
          </div>
        </div>

        <div id="runtime-notifications" class="runtime-notifications"></div>

        <div id="view" class="view"></div>
      </main>
    </div>
  `;

  renderSidebar(document.getElementById("sidebar"));

  renderWorkspaceDock(document.getElementById("workspace-dock"));
  renderWorkspaceContext(document.getElementById("workspace-context"));
  renderRuntimeNotifications(document.getElementById("runtime-notifications"));

  bindWorkspaceShell();

  const initial = window.location.pathname && window.location.pathname !== "/"
    ? window.location.pathname
    : "/";

  try {
    renderLayout(initial);
  } catch (err) {
    console.warn("initial render failed:", err);
  }
}
