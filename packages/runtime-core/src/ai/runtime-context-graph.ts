export interface RuntimeContextNode {
  id: string
  type: string
  metadata?: Record<string, unknown>
}

export class RuntimeContextGraph {
  private nodes: RuntimeContextNode[] = []

  register(node: RuntimeContextNode) {
    this.nodes.push(node)
  }

  graph() {
    return this.nodes
  }
}

export const runtimeContextGraph = new RuntimeContextGraph()
