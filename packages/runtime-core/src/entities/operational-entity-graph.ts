export interface OperationalEntity {
  id: string
  entity:
    | 'product'
    | 'customer'
    | 'supplier'
    | 'ticket'
    | 'invoice'
    | 'payment'
  relations: string[]
}

export class OperationalEntityGraph {
  private entities = new Map<string, OperationalEntity>()

  register(entity: OperationalEntity) {
    this.entities.set(entity.id, entity)
  }

  relate(source: string, target: string) {
    const entity = this.entities.get(source)

    if (!entity) {
      return
    }

    entity.relations.push(target)
  }

  topology() {
    return Array.from(this.entities.values())
  }
}

export const operationalEntityGraph = new OperationalEntityGraph()
