import { runtimeTelemetry } from '../telemetry/runtime-telemetry'
import { moduleHealthMonitor } from '../telemetry/module-health'

export class RuntimeIntegrationLayer {
  connectKernelToEvents() {
    runtimeTelemetry.publish({
      key: 'kernel.events.connected',
      value: 1,
      timestamp: Date.now(),
    })
  }

  connectShellToModules() {
    moduleHealthMonitor.update({
      moduleId: 'runtime-shell',
      healthy: true,
      updatedAt: Date.now(),
    })
  }

  initialize() {
    this.connectKernelToEvents()
    this.connectShellToModules()
  }
}

export const runtimeIntegrationLayer = new RuntimeIntegrationLayer()
