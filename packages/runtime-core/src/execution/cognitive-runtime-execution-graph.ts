export interface RuntimeExecutionNode {
  id: string
  workflow: string
  dependencies: string[]
  status: 'idle' | 'running' | 'completed'
}

export class CognitiveRuntimeExecutionGraph {
  private nodes: RuntimeExecutionNode[] = []

  register(node: RuntimeExecutionNode) {
    this.nodes.push(node)
  }

  dependencyGraph(nodeId: string) {
    return this.nodes.find((node) => node.id === nodeId)
  }

  traverse(workflow: string) {
    return this.nodes.filter((node) => node.workflow === workflow)
  }

  orchestrationTopology() {
    return this.nodes.map((node) => ({
      id: node.id,
      edges: node.dependencies,
    }))
  }
}

export const cognitiveRuntimeExecutionGraph =
  new CognitiveRuntimeExecutionGraph()
