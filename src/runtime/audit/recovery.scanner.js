import { getRouteRegistry } from "../../ui/layout/layout.engine.js";

function scanButtons() {
  const buttons = [...document.querySelectorAll("button")];

  return buttons.map((button, index) => ({
    id: button.id || `button-${index}`,
    text: button.textContent?.trim() || "unnamed",
    hasClickHandler: !!button.onclick,
    status: button.onclick ? "interactive" : "passive"
  }));
}

function scanInputs() {
  const fields = [...document.querySelectorAll("input,select,textarea")];

  return fields.map((field, index) => ({
    id: field.id || `field-${index}`,
    type: field.tagName.toLowerCase(),
    hasBinding: !!field.onchange || !!field.oninput,
    status: field.onchange || field.oninput ? "bound" : "unbound"
  }));
}

function scanRoutes() {
  const registry = getRouteRegistry();

  return registry.entries().map(([route, definition]) => ({
    route,
    title: definition.title,
    domain: definition.domain,
    hasLoader: typeof definition.load === "function",
    status: typeof definition.load === "function" ? "reachable" : "broken"
  }));
}

function detectPlaceholderSurfaces() {
  const placeholders = [];

  document.querySelectorAll("*").forEach((node) => {
    const text = node.textContent?.toLowerCase() || "";

    if (
      text.includes("coming soon") ||
      text.includes("placeholder") ||
      text.includes("todo")
    ) {
      placeholders.push({
        tag: node.tagName,
        text: text.slice(0, 80),
        status: "placeholder"
      });
    }
  });

  return placeholders;
}

export function runRecoveryScannerPass() {
  const report = {
    generatedAt: new Date().toISOString(),
    routes: scanRoutes(),
    buttons: scanButtons(),
    fields: scanInputs(),
    placeholders: detectPlaceholderSurfaces()
  };

  report.summary = {
    reachableRoutes: report.routes.filter(r => r.status === "reachable").length,
    brokenRoutes: report.routes.filter(r => r.status === "broken").length,
    interactiveButtons: report.buttons.filter(b => b.status === "interactive").length,
    passiveButtons: report.buttons.filter(b => b.status === "passive").length,
    unboundFields: report.fields.filter(f => f.status === "unbound").length,
    placeholderSurfaces: report.placeholders.length
  };

  window.__ERP_RECOVERY_REPORT__ = report;

  console.group("ERP Recovery Scanner");
  console.table(report.summary);
  console.table(report.routes);
  console.groupEnd();

  return report;
}
