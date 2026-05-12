export interface ModuleHealthState {
  moduleId: string
  healthy: boolean
  updatedAt: number
}

export class ModuleHealthMonitor {
  private states: ModuleHealthState[] = []

  update(state: ModuleHealthState) {
    this.states.unshift(state)
  }

  current() {
    return this.states
  }
}

export const moduleHealthMonitor = new ModuleHealthMonitor()
