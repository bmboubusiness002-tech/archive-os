export interface ExecutableRuntimeDomain {
  id: string
  name: string
  workflows: string[]
  telemetryChannel: string
  graphNodes: string[]
}

export const executableRuntimeDomains: ExecutableRuntimeDomain[] = [
  {
    id: 'inventory',
    name: 'Inventory Runtime Domain',
    workflows: ['inventory-movement', 'stock-sync'],
    telemetryChannel: 'inventory.telemetry',
    graphNodes: ['inventory-stock', 'inventory-warehouse'],
  },
  {
    id: 'pos',
    name: 'POS Runtime Domain',
    workflows: ['checkout', 'receipt-generation'],
    telemetryChannel: 'pos.telemetry',
    graphNodes: ['pos-sale', 'pos-session'],
  },
  {
    id: 'finance',
    name: 'Finance Runtime Domain',
    workflows: ['ledger-execution', 'cash-reconciliation'],
    telemetryChannel: 'finance.telemetry',
    graphNodes: ['finance-ledger', 'finance-journal'],
  },
  {
    id: 'repairflow',
    name: 'RepairFlow Runtime Domain',
    workflows: ['repair-lifecycle', 'diagnostic-pipeline'],
    telemetryChannel: 'repairflow.telemetry',
    graphNodes: ['repair-ticket', 'repair-diagnostics'],
  },
]
