export interface ExecutableRuntimeEntity {
  id: string
  type:
    | 'product'
    | 'customer'
    | 'supplier'
    | 'invoice'
    | 'ticket'
    | 'payment'
  state: Record<string, unknown>
  executable: boolean
}

export class RealRuntimeEntityEngine {
  private entities = new Map<string, ExecutableRuntimeEntity>()

  register(entity: ExecutableRuntimeEntity) {
    this.entities.set(entity.id, entity)
  }

  execute(id: string) {
    const entity = this.entities.get(id)

    if (!entity) {
      return null
    }

    return {
      entity,
      executedAt: Date.now(),
    }
  }

  topology() {
    return Array.from(this.entities.values())
  }
}

export const realRuntimeEntityEngine =
  new RealRuntimeEntityEngine()
