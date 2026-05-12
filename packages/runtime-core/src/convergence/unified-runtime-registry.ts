export interface RuntimeRegistryEntry {
  id: string
  category:
    | 'module'
    | 'widget'
    | 'agent'
    | 'telemetry'
    | 'workflow'
    | 'memory'
  definition: unknown
}

export class UnifiedRuntimeRegistry {
  private entries = new Map<string, RuntimeRegistryEntry>()

  register(entry: RuntimeRegistryEntry) {
    this.entries.set(entry.id, entry)
  }

  resolve(id: string) {
    return this.entries.get(id)
  }

  all(category?: RuntimeRegistryEntry['category']) {
    const values = Array.from(this.entries.values())

    if (!category) {
      return values
    }

    return values.filter((entry) => entry.category === category)
  }
}

export const unifiedRuntimeRegistry = new UnifiedRuntimeRegistry()
