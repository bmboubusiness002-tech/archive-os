type RuntimeModule = {
  id: string
  name: string
  version: string
}

export class ModuleRegistry {
  private modules = new Map<string, RuntimeModule>()

  register(module: RuntimeModule) {
    this.modules.set(module.id, module)
  }

  resolve(id: string) {
    return this.modules.get(id)
  }

  list() {
    return Array.from(this.modules.values())
  }
}

export const moduleRegistry = new ModuleRegistry()
