export interface ExecutableWorkflow {
  id: string
  trigger: string
  execution: string
}

export interface ExecutableRuntimeDomain {
  id: string
  name: string
  telemetryChannel: string
  persistenceKey: string
  workflows: ExecutableWorkflow[]
}

export const runtimeDomains: ExecutableRuntimeDomain[] = [
  {
    id: 'inventory',
    name: 'Inventory Runtime Domain',
    telemetryChannel: 'inventory.telemetry',
    persistenceKey: 'inventory-runtime',
    workflows: [
      {
        id: 'inventory-movement',
        trigger: 'inventory.move',
        execution: 'inventory-execution-pipeline',
      },
    ],
  },
  {
    id: 'pos',
    name: 'POS Runtime Domain',
    telemetryChannel: 'pos.telemetry',
    persistenceKey: 'pos-runtime',
    workflows: [
      {
        id: 'pos-checkout',
        trigger: 'pos.checkout',
        execution: 'checkout-execution-pipeline',
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance Runtime Domain',
    telemetryChannel: 'finance.telemetry',
    persistenceKey: 'finance-runtime',
    workflows: [
      {
        id: 'ledger-execution',
        trigger: 'finance.ledger.execute',
        execution: 'ledger-runtime-pipeline',
      },
    ],
  },
  {
    id: 'repair-flow',
    name: 'RepairFlow Runtime Domain',
    telemetryChannel: 'repair.telemetry',
    persistenceKey: 'repair-runtime',
    workflows: [
      {
        id: 'repair-lifecycle',
        trigger: 'repair.lifecycle',
        execution: 'repair-runtime-pipeline',
      },
    ],
  },
]
