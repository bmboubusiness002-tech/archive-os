import { realEventOrchestration } from '../orchestration/real-event-orchestration'

export class ExecutableOperationalWorkflows {
  checkout() {
    return realEventOrchestration.orchestrate('pos.checkout.completed')
  }

  inventoryMovement() {
    return realEventOrchestration.orchestrate('inventory.movement.executed')
  }

  repairLifecycle() {
    return realEventOrchestration.orchestrate('repair.lifecycle.transitioned')
  }

  purchaseWorkflow() {
    return realEventOrchestration.orchestrate('purchase.workflow.executed')
  }

  ledgerExecution() {
    return realEventOrchestration.orchestrate('finance.ledger.executed')
  }
}

export const executableOperationalWorkflows =
  new ExecutableOperationalWorkflows()
