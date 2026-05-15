// src/ui/layout/app.shell.js

import { renderLayout } from "./layout.engine.js";
import { renderSidebar } from "./sidebar.js";

import {
  renderWorkspaceDock,
  renderWorkspaceContext,
  renderRuntimeNotifications,
  bindWorkspaceShell
} from "../../runtime/workspace/workspace.shell.js";

import { initializeRuntimeTelemetry } from "../../runtime/telemetry/runtime.telemetry.js";

import { printRuntimeAuditReport } from "../../runtime/audit/runtime.audit.js";
import { runRuntimeDiagnostics } from "../../runtime/audit/runtime.diagnostics.js";
import { buildDependencyGraph } from "../../runtime/audit/dependency.graph.js";
import { runRecoveryScannerPass } from "../../runtime/audit/recovery.scanner.js";
import { runLiveExecutionAudit } from "../../runtime/audit/live.execution.audit.js";
import { runWorkflowTransactionAudit } from "../../runtime/audit/workflow.transaction.audit.js";
import { runBusinessIntegrityAudit } from "../../runtime/audit/business.integrity.engine.js";
import { generateRecoveryBacklog } from "../../runtime/audit/recovery.backlog.generator.js";
import { buildRuntimeRecoveryMap } from "../../runtime/recovery/runtime.recovery.map.js";

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

  initializeRuntimeTelemetry();

  try {
    printRuntimeAuditReport();
    runRuntimeDiagnostics();
    buildDependencyGraph();
    runRecoveryScannerPass();

    setTimeout(async () => {
      await runLiveExecutionAudit();
      await runWorkflowTransactionAudit();
      await runBusinessIntegrityAudit();
      generateRecoveryBacklog();
      buildRuntimeRecoveryMap();
    }, 250);
  } catch (error) {
    console.warn("runtime audit failed", error);
  }

  const initial = window.location.pathname && window.location.pathname !== "/"
    ? window.location.pathname
    : "/";

  try {
    renderLayout(initial);
  } catch (err) {
    console.warn("initial render failed:", err);
  }
}
