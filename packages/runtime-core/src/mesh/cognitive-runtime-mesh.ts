export interface RuntimeMeshNode {
  id: string
  module: string
  cognition: string[]
}

export class CognitiveRuntimeMesh {
  private nodes: RuntimeMeshNode[] = []

  connect(node: RuntimeMeshNode) {
    this.nodes.push(node)
  }

  topology() {
    return this.nodes.map((node) => ({
      id: node.id,
      links: node.cognition,
    }))
  }

  propagate(signal: string) {
    return {
      signal,
      propagatedAcross: this.nodes.length,
      propagatedAt: Date.now(),
    }
  }

  cognition(module: string) {
    return this.nodes.filter((node) => node.module === module)
  }
}

export const cognitiveRuntimeMesh = new CognitiveRuntimeMesh()
