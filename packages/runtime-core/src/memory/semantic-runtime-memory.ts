import { operationalKnowledgeGraph } from '../knowledge/operational-knowledge-graph'

export interface SemanticMemoryEntity {
  id: string
  entity: string
  embedding: number[]
  context: string
  timestamp: number
}

export class SemanticRuntimeMemory {
  private entities: SemanticMemoryEntity[] = []

  index(entity: SemanticMemoryEntity) {
    this.entities.unshift(entity)

    operationalKnowledgeGraph.register({
      id: entity.id,
      type: 'semantic-memory',
      relations: [entity.context],
    })
  }

  retrieve(context: string) {
    return this.entities.filter((entity) =>
      entity.context.includes(context),
    )
  }

  timeline() {
    return [...this.entities].sort((a, b) => b.timestamp - a.timestamp)
  }

  traverse(entityId: string) {
    return operationalKnowledgeGraph.traverse(entityId)
  }
}

export const semanticRuntimeMemory = new SemanticRuntimeMemory()
