function item(type, severity, moduleName, description, details = {}) {
  return {
    type,
    severity,
    module: moduleName || "unknown",
    description,
    details,
    createdAt: new Date().toISOString()
  };
}

function fromLiveAudit(report) {
  if (!report || !Array.isArray(report.routes)) return [];

  return report.routes
    .filter((route) => route.status === "failed")
    .map((route) => item(
      "route-failure",
      "critical",
      route.route || route.path || "route",
      "Route failed during live render audit",
      { error: route.error || null }
    ));
}

function fromWorkflowAudit(report) {
  if (!report || !Array.isArray(report.workflows)) return [];

  return report.workflows
    .filter((workflow) => workflow.status !== "operational" && workflow.status !== "healthy")
    .map((workflow) => item(
      "workflow-issue",
      workflow.status === "failed" ? "critical" : "high",
      workflow.workflow || "workflow",
      "Workflow is not fully operational",
      { status: workflow.status, issues: workflow.issues || [] }
    ));
}

function fromIntegrityAudit(report) {
  if (!report || !Array.isArray(report.workflows)) return [];

  return report.workflows.flatMap((workflow) => {
    return (workflow.issues || []).map((issue) => item(
      "integrity-issue",
      issue.severity || "medium",
      workflow.workflow || "workflow",
      issue.type || "Business integrity issue",
      { details: issue.details || {} }
    ));
  });
}

function scoreModules(items) {
  const modules = new Map();
  const weights = {
    critical: 40,
    high: 20,
    medium: 10,
    low: 5
  };

  for (const entry of items) {
    const current = modules.get(entry.module) || {
      module: entry.module,
      score: 100,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    current[entry.severity] = (current[entry.severity] || 0) + 1;
    current.score -= weights[entry.severity] || 5;

    modules.set(entry.module, current);
  }

  return [...modules.values()]
    .map((module) => ({
      ...module,
      score: Math.max(0, module.score)
    }))
    .sort((a, b) => a.score - b.score);
}

export function buildRuntimeRecoveryMap() {
  const liveAudit = window.__ERP_LIVE_EXECUTION_AUDIT__ || null;
  const workflowAudit = window.__ERP_WORKFLOW_AUDIT__ || null;
  const integrityAudit = window.__ERP_BUSINESS_INTEGRITY_REPORT__ || null;

  const issues = [
    ...fromLiveAudit(liveAudit),
    ...fromWorkflowAudit(workflowAudit),
    ...fromIntegrityAudit(integrityAudit)
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    totalIssues: issues.length,
    criticalIssues: issues.filter((issue) => issue.severity === "critical").length,
    highIssues: issues.filter((issue) => issue.severity === "high").length,
    issues,
    moduleHealth: scoreModules(issues)
  };

  window.__ERP_RUNTIME_RECOVERY_MAP__ = report;

  console.group("ERP Runtime Recovery Map");
  console.table(report.moduleHealth);
  console.table(report.issues);
  console.groupEnd();

  return report;
}
