import { getRouteRegistry } from "../../ui/layout/layout.engine.js";

function inspectRoute(route, definition) {
  const issues = [];

  if (!definition) {
    issues.push("missing-definition");
  }

  if (!definition?.title) {
    issues.push("missing-title");
  }

  if (typeof definition?.load !== "function") {
    issues.push("missing-loader");
  }

  return {
    route,
    domain: definition?.domain || "unknown",
    title: definition?.title || route,
    issues,
    status: issues.length ? "broken" : "stable"
  };
}

function inspectLoader(route, definition) {
  const issues = [];

  try {
    const source = String(definition.load);

    if (source.includes("ComingSoon")) {
      issues.push("placeholder-renderer");
    }

    if (source.includes("TODO")) {
      issues.push("todo-renderer");
    }

    if (source.includes("console.log")) {
      issues.push("debug-renderer");
    }
  } catch (error) {
    issues.push(`loader-analysis-failed:${error.message}`);
  }

  return {
    route,
    issues,
    status: issues.length ? "partial" : "stable"
  };
}

function inspectRuntimeBindings() {
  const checks = [];

  checks.push({
    binding: "workspace-runtime",
    exists: !!window.__ERP_RUNTIME_STATE__,
    status: window.__ERP_RUNTIME_STATE__ ? "stable" : "missing"
  });

  checks.push({
    binding: "route-registry",
    exists: !!getRouteRegistry,
    status: getRouteRegistry ? "stable" : "missing"
  });

  return checks;
}

function inspectDomSurfaces() {
  const surfaces = [
    "sidebar",
    "view",
    "workspace-context",
    "workspace-dock"
  ];

  return surfaces.map(id => ({
    surface: id,
    exists: !!document.getElementById(id),
    status: document.getElementById(id) ? "stable" : "missing"
  }));
}

export function runRuntimeDiagnostics() {
  const registry = getRouteRegistry();
  const routes = registry.entries();

  const routeAudit = [];
  const loaderAudit = [];

  for (const [route, definition] of routes) {
    routeAudit.push(inspectRoute(route, definition));
    loaderAudit.push(inspectLoader(route, definition));
  }

  const diagnostics = {
    generatedAt: new Date().toISOString(),
    totals: {
      routes: routes.length,
      brokenRoutes: routeAudit.filter(r => r.status === "broken").length,
      partialLoaders: loaderAudit.filter(r => r.status === "partial").length
    },
    routes: routeAudit,
    loaders: loaderAudit,
    runtimeBindings: inspectRuntimeBindings(),
    domSurfaces: inspectDomSurfaces()
  };

  window.__ERP_RUNTIME_DIAGNOSTICS__ = diagnostics;

  console.group("ERP Runtime Diagnostics");
  console.table(diagnostics.totals);
  console.table(diagnostics.runtimeBindings);
  console.table(diagnostics.domSurfaces);
  console.groupEnd();

  return diagnostics;
}
