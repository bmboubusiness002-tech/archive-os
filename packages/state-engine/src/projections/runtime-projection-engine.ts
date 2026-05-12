export interface RuntimeProjection {
  id: string
  source: string
  materializedAt: number
  state: Record<string, unknown>
}

export class RuntimeProjectionEngine {
  private projections = new Map<string, RuntimeProjection>()

  materialize(projection: RuntimeProjection) {
    this.projections.set(projection.id, projection)
  }

  view(id: string) {
    return this.projections.get(id)
  }

  analytics() {
    return Array.from(this.projections.values())
  }
}

export const runtimeProjectionEngine = new RuntimeProjectionEngine()
