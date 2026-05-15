function createAuditEvent(type, payload = {}) {
  return {
    type,
    payload,
    timestamp: new Date().toISOString()
  };
}

function createCartProbe() {
  const cart = {
    items: [],
    total: 0
  };

  return {
    addProduct(product) {
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
    },

    getCart() {
      return cart;
    }
  };
}

async function auditPOSWorkflow() {
  const events = [];

  try {
    const probe = createCartProbe();

    events.push(createAuditEvent("pos.audit.probe.created"));

    probe.addProduct({
      id: "audit-product-1",
      name: "Audit Product",
      price: 10
    });

    const cart = probe.getCart();

    events.push(createAuditEvent("pos.audit.product.added", {
      cart
    }));

    return {
      workflow: "pos",
      status: cart.items.length > 0 && cart.total === 10 ? "operational" : "broken",
      cartItems: cart.items.length,
      total: cart.total,
      events
    };
  } catch (error) {
    return {
      workflow: "pos",
      status: "failed",
      error: {
        message: error?.message || "unknown error",
        stack: error?.stack || null
      },
      events
    };
  }
}

function auditModalRuntime() {
  const modals = [...document.querySelectorAll(".modal")];

  return {
    count: modals.length,
    active: modals.filter((modal) => !modal.classList.contains("hidden")).length
  };
}

function auditStatePersistence() {
  try {
    localStorage.setItem("__erp_audit_test__", "ok");

    const value = localStorage.getItem("__erp_audit_test__");

    localStorage.removeItem("__erp_audit_test__");

    return {
      status: value === "ok" ? "working" : "broken"
    };
  } catch (error) {
    return {
      status: "failed",
      error: error?.message || "storage error"
    };
  }
}

export async function runWorkflowTransactionAudit() {
  const workflows = [];

  workflows.push(await auditPOSWorkflow());

  const report = {
    generatedAt: new Date().toISOString(),
    workflows,
    modals: auditModalRuntime(),
    persistence: auditStatePersistence()
  };

  report.summary = {
    operationalWorkflows: workflows.filter((workflow) => workflow.status === "operational").length,
    brokenWorkflows: workflows.filter((workflow) => workflow.status !== "operational").length,
    modalCount: report.modals.count,
    persistence: report.persistence.status
  };

  window.__ERP_WORKFLOW_AUDIT__ = report;

  console.group("ERP Workflow Transaction Audit");
  console.table(report.summary);
  console.table(workflows);
  console.groupEnd();

  return report;
}
