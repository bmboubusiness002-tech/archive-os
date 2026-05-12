import { posRuntimeWorkflow } from '../workflows/pos-runtime-workflow'
import { repairflowRuntimeWorkflow } from '../workflows/repairflow-runtime-workflow'
import { financeRuntimeWorkflow } from '../workflows/finance-runtime-workflow'

export class RealRuntimeDomainExecution {
  executePOS(orderId: string) {
    return posRuntimeWorkflow.checkout(orderId)
  }

  executeInventory(movementId: string) {
    return {
      movementId,
      execution: 'inventory-runtime-execution',
      executedAt: Date.now(),
    }
  }

  executeFinance(entryId: string) {
    return financeRuntimeWorkflow.execute(entryId)
  }

  executeRepair(ticketId: string) {
    return repairflowRuntimeWorkflow.lifecycle(ticketId)
  }
}

export const realRuntimeDomainExecution =
  new RealRuntimeDomainExecution()
