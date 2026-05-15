import { getRouteRegistry } from "../../ui/layout/layout.engine.js";

export function createRuntimeAuditReport() {
  const registry = getRouteRegistry();
  const routes = registry.entries();

  const report = {
    totalRoutes: routes.length,
    implemented: [],
    placeholders: [],
    broken: [],
    domains: {}
  };

  for (const [route, definition] of routes) {
    const domain = definition.domain || "unknown";

    if (!report.domains[domain]) {
      report.domains[domain] = {
        total: 0,
        implemented: 0,
        broken: 0
      };
    }

    report.domains[domain].total += 1;

    const entry = {
      route,
      title: definition.title,
      domain,
      hasLoader: typeof definition.load === "function"
    };

    if (!entry.hasLoader) {
      report.broken.push({
        ...entry,
        reason: "missing-render-function"
      });

      report.domains[domain].broken += 1;
      continue;
    }

    try {
      const loaderSource = String(definition.load);

      if (
        loaderSource.includes("renderComingSoon") ||
        loaderSource.includes("placeholder")
      ) {
        report.placeholders.push(entry);
      } else {
        report.implemented.push(entry);
        report.domains[domain].implemented += 1;
      }
    } catch (error) {
      report.broken.push({
        ...entry,
        reason: error.message
      });

      report.domains[domain].broken += 1;
    }
  }

  return report;
}

export function printRuntimeAuditReport() {
  const report = createRuntimeAuditReport();

  console.group("ERP Runtime Audit");
  console.table(report.domains);
  console.log("Implemented:", report.implemented.length);
  console.log("Placeholders:", report.placeholders.length);
  console.log("Broken:", report.broken.length);
  console.groupEnd();

  return report;
}
