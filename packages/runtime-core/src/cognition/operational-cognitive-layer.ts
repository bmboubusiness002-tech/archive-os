import { operationalMemoryIndex } from '../ai/operational-memory-index'
import { operationalKnowledgeGraph } from '../knowledge/operational-knowledge-graph'

export class OperationalCognitiveLayer {
  remember(category: string) {
    operationalMemoryIndex.index({
      id: crypto.randomUUID(),
      category,
      createdAt: Date.now(),
    })
  }

  reason(entityId: string) {
    return operationalKnowledgeGraph.traverse(entityId)
  }

  relations(entityId: string) {
    return operationalKnowledgeGraph.relations(entityId)
  }
}

export const operationalCognitiveLayer = new OperationalCognitiveLayer()
