import { RuntimeServices } from './runtime-services'
import type { RuntimeContext } from './runtime-context'
import { moduleRegistry } from '../registry/module-registry'

export class RuntimeKernel {
  public services = new RuntimeServices()

  private context: RuntimeContext = {
    initialized: false,
    startedAt: Date.now(),
  }

  async boot() {
    this.context.initialized = true

    console.info('[kernel] runtime boot sequence initialized')
  }

  register(module: {
    id: string
    name: string
    version: string
  }) {
    moduleRegistry.register(module)
  }

  modules() {
    return moduleRegistry.list()
  }

  getContext() {
    return this.context
  }
}

export const runtimeKernel = new RuntimeKernel()
