import { runtimeCompositionGraph } from '../convergence/runtime-composition-graph'
import { runtimeExecutionPipeline } from '../convergence/runtime-execution-pipeline'
import { persistentRuntimeState } from '../convergence/persistent-runtime-state'

export class RealEventOrchestration {
  orchestrate(event: string) {
    runtimeExecutionPipeline.enqueue({
      id: crypto.randomUUID(),
      action: event,
      status: 'pending',
    })

    runtimeCompositionGraph.register({
      id: event,
      type: 'workflow',
      relations: [],
    })

    persistentRuntimeState.save({
      id: crypto.randomUUID(),
      telemetry: [event],
      workspaces: [],
      replayState: [event],
      archivedState: [event],
    })

    return runtimeExecutionPipeline.execute()
  }
}

export const realEventOrchestration = new RealEventOrchestration()
