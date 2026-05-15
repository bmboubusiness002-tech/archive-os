import { createPOSFlow } from "../../modules/pos/pos.flow.js";

function createIntegrityIssue(type, severity, details) {
  return {
    type,
    severity,
    details,
    timestamp: new Date().toISOString()
  };
}

function validateCartTotals(cart) {
  const calculated = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.qty);
  }, 0);

  if (calculated !== cart.total) {
    return createIntegrityIssue(
      "cart.total.mismatch",
      "critical",
      {
        expected: calculated,
        actual: cart.total
      }
    );
  }

  return null;
}

function validateCartItems(cart) {
  const issues = [];

  cart.items.forEach(item => {
    if (!item.id) {
      issues.push(createIntegrityIssue(
        "product.id.missing",
        "high",
        item
      ));
    }

    if (typeof item.price !== "number") {
      issues.push(createIntegrityIssue(
        "product.price.invalid",
        "critical",
        item
      ));
    }

    if (item.qty <= 0) {
      issues.push(createIntegrityIssue(
        "product.qty.invalid",
        "high",
        item
      ));
    }
  });

  return issues;
}

function validatePersistenceLayer() {
  try {
    const payload = {
      timestamp: Date.now(),
      status: "ok"
    };

    localStorage.setItem("__erp_integrity_test__", JSON.stringify(payload));

    const restored = JSON.parse(
      localStorage.getItem("__erp_integrity_test__")
    );

    localStorage.removeItem("__erp_integrity_test__");

    if (!restored || restored.status !== "ok") {
      return createIntegrityIssue(
        "persistence.corrupted",
        "critical",
        restored
      );
    }

    return null;
  } catch (error) {
    return createIntegrityIssue(
      "persistence.failure",
      "critical",
      {
        message: error?.message || "storage failure"
      }
    );
  }
}

async function validatePOSBusinessFlow() {
  const issues = [];

  try {
    const flow = createPOSFlow();

    flow.addProduct({
      id: "integrity-product-1",
      name: "Integrity Product",
      price: 25
    });

    flow.addProduct({
      id: "integrity-product-1",
      name: "Integrity Product",
      price: 25
    });

    const cart = flow.getCart();

    const totalIssue = validateCartTotals(cart);

    if (totalIssue) {
      issues.push(totalIssue);
    }

    issues.push(...validateCartItems(cart));

    return {
      workflow: "pos",
      status: issues.length === 0 ? "healthy" : "degraded",
      cart,
      issues
    };
  } catch (error) {
    issues.push(createIntegrityIssue(
      "workflow.execution.failed",
      "critical",
      {
        message: error?.message || "workflow failure",
        stack: error?.stack || null
      }
    ));

    return {
      workflow: "pos",
      status: "failed",
      issues
    };
  }
}

export async function runBusinessIntegrityAudit() {
  const workflows = [];
  const globalIssues = [];

  const persistenceIssue = validatePersistenceLayer();

  if (persistenceIssue) {
    globalIssues.push(persistenceIssue);
  }

  workflows.push(await validatePOSBusinessFlow());

  const report = {
    generatedAt: new Date().toISOString(),
    workflows,
    globalIssues
  };

  report.summary = {
    healthyWorkflows: workflows.filter(w => w.status === "healthy").length,
    degradedWorkflows: workflows.filter(w => w.status === "degraded").length,
    failedWorkflows: workflows.filter(w => w.status === "failed").length,
    criticalIssues: [
      ...globalIssues,
      ...workflows.flatMap(w => w.issues || [])
    ].filter(issue => issue.severity === "critical").length
  };

  window.__ERP_BUSINESS_INTEGRITY_REPORT__ = report;

  console.group("ERP Business Integrity Audit");
  console.table(report.summary);
  console.table(workflows);
  console.groupEnd();

  return report;
}
