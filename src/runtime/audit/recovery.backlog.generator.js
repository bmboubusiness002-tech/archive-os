function normalizeIssue(source, category, severity, title, details = {}) {
  return {
    id: `${category}:${title}`,
    source,
    category,
    severity,
    title,
    details,
    createdAt: new Date().toISOString()
  };
}

function extractWorkflowIssues(report) {
  if (!report?.workflows) {
    return [];
  }

  return report.workflows.flatMap(workflow => {
    const issues = workflow.issues || [];

    return issues.map(issue => normalizeIssue(
      "workflow-audit",
      workflow.workflow || "workflow",
      issue.severity || "medium",
      issue.type || "workflow.issue",
      issue.details || {}
    ));
  });
}

function extractIntegrityIssues(report) {
  if (!report) {
    return [];
  }

  const globalIssues = (report.globalIssues || []).map(issue => normalizeIssue(
    "business-integrity",
    "global",
    issue.severity || "medium",
    issue.type || "integrity.issue",
    issue.details || {}
  ));

  const workflowIssues = (report.workflows || []).flatMap(workflow => {
    return (workflow.issues || []).map(issue => normalizeIssue(
      "business-integrity",
      workflow.workflow || "workflow",
      issue.severity || "medium",
      issue.type || "integrity.issue",
      issue.details || {}
    ));
  });

  return [...globalIssues, ...workflowIssues];
}

function extractExecutionFailures(report) {
  if (!report?.routes) {
    return [];
  }

  return report.routes
    .filter(route => route.status === "failed")
    .map(route => normalizeIssue(
      "live-execution",
      "route",
      "critical",
      `route.failed:${route.path}`,
      {
        error: route.error || null
      }
    ));
}

function buildRepairRecommendations(issue) {
  if (issue.title.includes("cart.total.mismatch")) {
    return [
      "validate cart reducers",
      "verify quantity mutations",
      "audit pricing calculations"
    ];
  }

  if (issue.title.includes("route.failed")) {
    return [
      "verify imports",
      "inspect render function",
      "check missing dependencies"
    ];
  }

  if (issue.title.includes("persistence")) {
    return [
      "inspect localStorage access",
      "validate serialization",
      "check browser runtime restrictions"
    ];
  }

  return [
    "inspect runtime logs",
    "audit related workflow",
    "verify state consistency"
  ];
}

function prioritizeIssues(issues) {
  const weights = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  };

  return issues
    .map(issue => ({
      ...issue,
      priorityScore: weights[issue.severity] || 10,
      recommendations: buildRepairRecommendations(issue)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function generateRecoveryBacklog() {
  const workflowAudit = window.__ERP_WORKFLOW_AUDIT__ || null;
  const integrityAudit = window.__ERP_BUSINESS_INTEGRITY_REPORT__ || null;
  const executionAudit = window.__ERP_LIVE_EXECUTION_AUDIT__ || null;

  const issues = [
    ...extractWorkflowIssues(workflowAudit),
    ...extractIntegrityIssues(integrityAudit),
    ...extractExecutionFailures(executionAudit)
  ];

  const prioritized = prioritizeIssues(issues);

  const report = {
    generatedAt: new Date().toISOString(),
    totalIssues: prioritized.length,
    criticalIssues: prioritized.filter(i => i.severity === "critical").length,
    highIssues: prioritized.filter(i => i.severity === "high").length,
    backlog: prioritized
  };

  window.__ERP_RECOVERY_BACKLOG__ = report;

  console.group("ERP Recovery Backlog");
  console.table(report.backlog);
  console.groupEnd();

  return report;
}
