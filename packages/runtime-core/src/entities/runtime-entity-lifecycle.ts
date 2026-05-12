export type RuntimeLifecycleStage =
  | 'created'
  | 'validated'
  | 'executed'
  | 'persisted'
  | 'archived'

export interface RuntimeLifecycleEntity {
  id: string
  domain: 'product' | 'invoice' | 'repair' | 'payment'
  stage: RuntimeLifecycleStage
  updatedAt: number
}

export class RuntimeEntityLifecycle {
  private entities = new Map<string, RuntimeLifecycleEntity>()

  register(entity: RuntimeLifecycleEntity) {
    this.entities.set(entity.id, entity)
  }

  transition(id: string, stage: RuntimeLifecycleStage) {
    const entity = this.entities.get(id)

    if (!entity) {
      return null
    }

    entity.stage = stage
    entity.updatedAt = Date.now()

    return entity
  }

  timeline(id: string) {
    return this.entities.get(id)
  }
}

export const runtimeEntityLifecycle = new RuntimeEntityLifecycle()
