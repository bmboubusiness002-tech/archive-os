import { getRouteRegistry, renderLayout } from "../../ui/layout/layout.engine.js";

function createExecutionResult(route, status, error = null) {
  return {
    route,
    status,
    error,
    timestamp: new Date().toISOString()
  };
}

async function executeRoute(route) {
  try {
    await renderLayout(route);

    return createExecutionResult(route, "rendered");
  } catch (error) {
    return createExecutionResult(route, "failed", {
      message: error?.message || "unknown error",
      stack: error?.stack || null
    });
  }
}

async function auditRoutes() {
  const registry = getRouteRegistry();
  const results = [];

  for (const [route] of registry.entries()) {
    const result = await executeRoute(route);
    results.push(result);
  }

  return results;
}

function auditDomHealth() {
  const view = document.getElementById("view");

  return {
    hasView: !!view,
    childCount: view?.children?.length || 0,
    htmlSize: view?.innerHTML?.length || 0,
    empty: !view?.innerHTML
  };
}

function detectDeadButtons() {
  return [...document.querySelectorAll("button")]
    .filter(button => !button.onclick)
    .map((button, index) => ({
      id: button.id || `dead-button-${index}`,
      text: button.textContent?.trim() || "unnamed"
    }));
}

function detectBrokenImages() {
  return [...document.querySelectorAll("img")]
    .filter(img => !img.complete)
    .map(img => ({
      src: img.src,
      alt: img.alt
    }));
}

export async function runLiveExecutionAudit() {
  const routeResults = await auditRoutes();

  const report = {
    generatedAt: new Date().toISOString(),
    routes: routeResults,
    dom: auditDomHealth(),
    deadButtons: detectDeadButtons(),
    brokenImages: detectBrokenImages()
  };

  report.summary = {
    renderedRoutes: report.routes.filter(r => r.status === "rendered").length,
    failedRoutes: report.routes.filter(r => r.status === "failed").length,
    deadButtons: report.deadButtons.length,
    brokenImages: report.brokenImages.length,
    domHealthy: !report.dom.empty
  };

  window.__ERP_LIVE_EXECUTION_AUDIT__ = report;

  console.group("ERP Live Execution Audit");
  console.table(report.summary);
  console.table(report.routes);
  console.groupEnd();

  return report;
}
