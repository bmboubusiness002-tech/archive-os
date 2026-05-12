export class PosRuntimeWorkflow {
  checkout(orderId: string) {
    return {
      orderId,
      stages: [
        'checkout',
        'payment',
        'receipt',
        'inventory-movement',
        'ledger-entries',
      ],
      executedAt: Date.now(),
    }
  }
}

export const posRuntimeWorkflow = new PosRuntimeWorkflow()
