export class RepairflowRuntimeWorkflow {
  lifecycle(ticketId: string) {
    return {
      ticketId,
      stages: [
        'ticket-created',
        'diagnostics',
        'parts-allocation',
        'billing',
        'delivery',
      ],
      executedAt: Date.now(),
    }
  }
}

export const repairflowRuntimeWorkflow =
  new RepairflowRuntimeWorkflow()
