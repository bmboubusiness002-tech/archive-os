import { renderLayout } from "./layout.engine.js";
import { getRuntimeModuleRegistry } from "../../runtime/registry/module.registry.js";
import { updateWorkspaceState } from "../../runtime/state/runtime.state.js";

const expanded = new Set(["intelligence", "operations"]);
let activeRoute = "/";

function buildMenu() {
  return getRuntimeModuleRegistry();
}

export function renderSidebar(root) {
  if (!root) return;

  root.innerHTML = `
    <div class="sidebar-root">
      <div class="brand"><span class="dot"></span> POS · ERP <span style="margin-left:auto;font-size:10px;color:#64748b;">v2026</span></div>
      <input class="sb-search" placeholder="🔎  Search…" />
      <div class="sb-menu">
        ${buildMenu().map(renderSection).join("")}
      </div>
    </div>
  `;

  bindEvents(root);
}

function renderSection(section) {
  const open = expanded.has(section.id);

  return `
    <div class="section ${open ? "open" : ""}" data-sec-id="${section.id}">
      <div class="section-title" data-section="${section.id}">
        <span>${section.label}</span>
        <span class="chev">▶</span>
      </div>
      <div class="section-body">
        ${section.children.map(renderNode).join("")}
      </div>
    </div>
  `;
}

function renderNode(node) {
  if (node.type === "group") {
    return `
      <div class="group">
        <div class="group-title">${node.label}</div>
        ${node.children.map(renderNode).join("")}
      </div>
    `;
  }

  const active = activeRoute === node.route ? "active" : "";

  return `
    <div class="item ${active}" data-route="${node.route}" data-label="${node.label}">
      <span class="ico">${node.icon || "•"}</span>
      <span class="lbl">${node.label}</span>
    </div>
  `;
}

function bindEvents(root) {
  root.querySelectorAll("[data-section]").forEach((element) => {
    element.onclick = () => {
      const id = element.dataset.section;

      if (expanded.has(id)) {
        expanded.delete(id);
      } else {
        expanded.add(id);
      }

      updateWorkspaceState({
        expandedSections: [...expanded]
      });

      renderSidebar(root);
    };
  });

  root.querySelectorAll("[data-route]").forEach((element) => {
    element.onclick = () => {
      const route = element.dataset.route;
      const label = element.dataset.label;

      activeRoute = route;

      updateWorkspaceState({
        activeRoute: route,
        activeLabel: label,
        lastNavigationAt: Date.now()
      });

      try {
        renderLayout(route, label);
      } catch (error) {
        console.warn("nav failed:", error);
      }

      renderSidebar(root);
    };
  });

  const search = root.querySelector(".sb-search");

  if (!search) return;

  search.oninput = () => {
    const query = search.value.trim().toLowerCase();

    updateWorkspaceState({
      navigationSearch: query
    });

    root.querySelectorAll(".item").forEach((item) => {
      const text = item.querySelector(".lbl")?.textContent.toLowerCase() || "";

      item.style.display = !query || text.includes(query) ? "flex" : "none";
    });

    if (query) {
      root.querySelectorAll(".section").forEach((section) => {
        section.classList.add("open");
      });
    }
  };
}
