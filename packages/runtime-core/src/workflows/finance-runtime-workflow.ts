export class FinanceRuntimeWorkflow {
  execute(entryId: string) {
    return {
      entryId,
      stages: [
        'journal-execution',
        'cash-movement',
        'ledger-balancing',
      ],
      executedAt: Date.now(),
    }
  }
}

export const financeRuntimeWorkflow = new FinanceRuntimeWorkflow()
