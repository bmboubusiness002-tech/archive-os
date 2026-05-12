import { runtimeIntegrationLayer } from '../integration/runtime-integration-layer'
import { runtimeTelemetry } from '../telemetry/runtime-telemetry'
import { runtimeContextGraph } from '../ai/runtime-context-graph'

export class RuntimeOrchestrator {
  async bootstrap() {
    runtimeIntegrationLayer.initialize()

    runtimeTelemetry.publish({
      key: 'runtime.bootstrap',
      value: 1,
      timestamp: Date.now(),
    })

    runtimeContextGraph.register({
      id: 'runtime-root',
      type: 'runtime-root',
    })
  }
}

export const runtimeOrchestrator = new RuntimeOrchestrator()
