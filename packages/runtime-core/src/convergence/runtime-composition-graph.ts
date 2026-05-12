export interface RuntimeNode {
  id: string
  type: 'module' | 'widget' | 'agent' | 'workflow' | 'memory' | 'telemetry'
  relations: string[]
  metadata?: Record<string, unknown>
}

export class RuntimeCompositionGraph {
  private nodes = new Map<string, RuntimeNode>()

  register(node: RuntimeNode) {
    this.nodes.set(node.id, node)
  }

  connect(source: string, target: string) {
    const node = this.nodes.get(source)

    if (!node) {
      return
    }

    node.relations.push(target)
  }

  getNode(id: string) {
    return this.nodes.get(id)
  }

  getTopology() {
    return Array.from(this.nodes.values())
  }
}
