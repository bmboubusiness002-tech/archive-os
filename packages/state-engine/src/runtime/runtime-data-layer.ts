export interface RuntimeEntity {
  id: string
  type: string
  payload: Record<string, unknown>
}

export class RuntimeDataLayer {
  private entities = new Map<string, RuntimeEntity>()
  private projections = new Map<string, RuntimeEntity[]>()
  private runtimeCache = new Map<string, unknown>()

  persist(entity: RuntimeEntity) {
    this.entities.set(entity.id, entity)
    return entity
  }

  repository(type: string) {
    return Array.from(this.entities.values()).filter(
      (entity) => entity.type === type,
    )
  }

  project(name: string, entities: RuntimeEntity[]) {
    this.projections.set(name, entities)
  }

  cache(key: string, value: unknown) {
    this.runtimeCache.set(key, value)
  }
}

export const runtimeDataLayer = new RuntimeDataLayer()
