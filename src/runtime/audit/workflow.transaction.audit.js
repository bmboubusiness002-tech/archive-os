import { createPOSFlow } from "../../modules/pos/pos.flow.js";

function createAuditEvent(type, payload = {}) {
  return {
    type,
    payload,
    timestamp: new Date().toISOString()
  };
}

async function auditPOSWorkflow() {
  const events = [];

  try {
    const flow = createPOSFlow();

    events.push(createAuditEvent("pos.flow.created"));

    flow.addProduct({
      id: "audit-product-1",
      name: "Audit Product",
      price: 10
    });

    events.push(createAuditEvent("pos.product.added", {
      cart: flow.getCart()
    }));

    const cart = flow.getCart();

    return {
      workflow: "pos",
      status: cart.items.length > 0 ? "operational" : "broken",
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
    active: modals.filter(modal => !modal.classList.contains("hidden")).length
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
    operationalWorkflows: workflows.filter(w => w.status === "operational").length,
    brokenWorkflows: workflows.filter(w => w.status !== "operational").length,
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
