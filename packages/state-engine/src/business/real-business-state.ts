export interface BusinessStateNode {
  id: string
  domain: 'inventory' | 'customer' | 'finance' | 'repair'
  state: Record<string, unknown>
  transitionedAt: number
}

export class RealBusinessState {
  private states = new Map<string, BusinessStateNode>()

  transition(node: BusinessStateNode) {
    this.states.set(node.id, node)
  }

  inventoryState() {
    return this.filterByDomain('inventory')
  }

  customerState() {
    return this.filterByDomain('customer')
  }

  financeState() {
    return this.filterByDomain('finance')
  }

  repairState() {
    return this.filterByDomain('repair')
  }

  private filterByDomain(domain: BusinessStateNode['domain']) {
    return Array.from(this.states.values()).filter(
      (node) => node.domain === domain,
    )
  }
}

export const realBusinessState = new RealBusinessState()
