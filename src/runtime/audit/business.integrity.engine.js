function createIntegrityIssue(type, severity, details) {
  return {
    type,
    severity,
    details,
    timestamp: new Date().toISOString()
  };
}

function createIntegrityCart() {
  return {
    items: [],
    total: 0
  };
}

function addIntegrityProduct(cart, product) {
  const existing = cart.items.find((item) => item.id === product.id);

  if (existing) {
    existing.qty += 1;
    existing.total = existing.qty * existing.price;
  } else {
    cart.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      total: product.price
    });
  }

  cart.total = cart.items.reduce((sum, item) => sum + item.total, 0);
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

  cart.items.forEach((item) => {
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
    const cart = createIntegrityCart();

    addIntegrityProduct(cart, {
      id: "integrity-product-1",
      name: "Integrity Product",
      price: 25
    });

    addIntegrityProduct(cart, {
      id: "integrity-product-1",
      name: "Integrity Product",
      price: 25
    });

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
    healthyWorkflows: workflows.filter((workflow) => workflow.status === "healthy").length,
    degradedWorkflows: workflows.filter((workflow) => workflow.status === "degraded").length,
    failedWorkflows: workflows.filter((workflow) => workflow.status === "failed").length,
    criticalIssues: [
      ...globalIssues,
      ...workflows.flatMap((workflow) => workflow.issues || [])
    ].filter((issue) => issue.severity === "critical").length
  };

  window.__ERP_BUSINESS_INTEGRITY_REPORT__ = report;

  console.group("ERP Business Integrity Audit");
  console.table(report.summary);
  console.table(workflows);
  console.groupEnd();

  return report;
}
