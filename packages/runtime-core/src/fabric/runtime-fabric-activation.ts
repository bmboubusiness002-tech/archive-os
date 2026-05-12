import { executableOperationalGraph } from '../convergence/executable-operational-graph'
import { unifiedRuntimeRegistry } from '../convergence/unified-runtime-registry'
import { persistentRuntimeState } from '../convergence/persistent-runtime-state'

export class RuntimeFabricActivation {
  bootstrap() {
    return {
      registry: unifiedRuntimeRegistry.all(),
      topology: executableOperationalGraph.topology(),
      runtime: 'bootstrapped',
    }
  }

  synchronize() {
    return {
      synchronization: 'active',
      timestamp: Date.now(),
    }
  }

  hydrate(snapshotId: string) {
    return persistentRuntimeState.restore(snapshotId)
  }

  activateGraph(nodeId: string) {
    return executableOperationalGraph.execute(nodeId)
  }
}

export const runtimeFabricActivation = new RuntimeFabricActivation()
