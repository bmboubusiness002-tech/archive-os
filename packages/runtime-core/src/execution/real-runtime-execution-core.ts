export class RealRuntimeExecutionCore {
  workflowExecution(workflow: string) {
    return {
      workflow,
      execution: 'workflow-execution-engine',
      executedAt: Date.now(),
    }
  }

  transactionExecution(transaction: string) {
    return {
      transaction,
      execution: 'transaction-runtime-execution',
      executedAt: Date.now(),
    }
  }

  eventExecution(event: string) {
    return {
      event,
      execution: 'event-runtime-execution',
      executedAt: Date.now(),
    }
  }

  graphExecution(node: string) {
    return {
      node,
      execution: 'graph-runtime-execution',
      executedAt: Date.now(),
    }
  }

  operationalCoordination(runtime: string) {
    return {
      runtime,
      coordination: 'operational-runtime-coordination',
      executedAt: Date.now(),
    }
  }
}

export const realRuntimeExecutionCore =
  new RealRuntimeExecutionCore()
