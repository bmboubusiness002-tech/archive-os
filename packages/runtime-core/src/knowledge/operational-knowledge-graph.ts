export interface KnowledgeEntity {
  id: string
  type: string
  relations: string[]
}

export class OperationalKnowledgeGraph {
  private entities: KnowledgeEntity[] = []

  register(entity: KnowledgeEntity) {
    this.entities.push(entity)
  }

  traverse(entityId: string) {
    return this.entities.find((entity) => entity.id === entityId)
  }

  relations(entityId: string) {
    const entity = this.entities.find((entry) => entry.id === entityId)

    return entity?.relations || []
  }
}

export const operationalKnowledgeGraph = new OperationalKnowledgeGraph()
