export class RealWorkflowRuntimeExecution {
  posCheckoutLifecycle(orderId: string) {
    return {
      orderId,
      workflow: 'pos-checkout-lifecycle',
      executedAt: Date.now(),
    }
  }

  inventoryMovementLifecycle(movementId: string) {
    return {
      movementId,
      workflow: 'inventory-movement-lifecycle',
      executedAt: Date.now(),
    }
  }

  repairTicketLifecycle(ticketId: string) {
    return {
      ticketId,
      workflow: 'repair-ticket-lifecycle',
      executedAt: Date.now(),
    }
  }

  invoiceLifecycle(invoiceId: string) {
    return {
      invoiceId,
      workflow: 'invoice-lifecycle',
      executedAt: Date.now(),
    }
  }

  paymentLifecycle(paymentId: string) {
    return {
      paymentId,
      workflow: 'payment-lifecycle',
      executedAt: Date.now(),
    }
  }
}

export const realWorkflowRuntimeExecution =
  new RealWorkflowRuntimeExecution()
