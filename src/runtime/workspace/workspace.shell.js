import { getWorkspaceState, onRuntimeState } from "../state/runtime.state.js";

export function renderWorkspaceDock(root) {
  if (!root) return;

  root.innerHTML = `
    <button data-workspace-action="command">⌘ Command</button>
    <button data-workspace-action="notifications">🔔 Alerts</button>
    <button data-workspace-action="context">◧ Context</button>
  `;
}

export function renderWorkspaceContext(root) {
  if (!root) return;

  const state = getWorkspaceState();

  root.innerHTML = `
    <div class="workspace-context-card">
      <span>Active workspace</span>
      <strong>${state.currentLabel || state.activeLabel || "Dashboard"}</strong>
      <small>${state.currentDomain || "core"}</small>
    </div>
  `;
}

export function renderRuntimeNotifications(root) {
  if (!root) return;

  root.innerHTML = `
    <div class="runtime-notification">
      <strong>Runtime ready</strong>
      <span>Workspace state and navigation tracking enabled.</span>
    </div>
  `;
}

export function bindWorkspaceShell() {
  const contextRoot = document.getElementById("workspace-context");

  renderWorkspaceContext(contextRoot);

  onRuntimeState("workspace", () => {
    renderWorkspaceContext(contextRoot);
  });
}
