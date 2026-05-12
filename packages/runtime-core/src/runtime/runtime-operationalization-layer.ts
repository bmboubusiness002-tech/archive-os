import { runtimeOperationalEventBus } from '@workspace/event-bus'
import { runtimeOperationalTelemetry } from '../telemetry/runtime-operational-telemetry'
import { persistentOperationalRuntime } from '../convergence/persistent-operational-runtime'

export class RuntimeOperationalizationLayer {
  initialize() {
    return {
      eventBus: runtimeOperationalEventBus,
      telemetry: runtimeOperationalTelemetry.stream(),
      persistence: persistentOperationalRuntime,
      runtime: 'operationalized',
      initializedAt: Date.now(),
    }
  }

  replay(snapshotId: string) {
    return persistentOperationalRuntime.replay(snapshotId)
  }
}

export const runtimeOperationalizationLayer =
  new RuntimeOperationalizationLayer()
