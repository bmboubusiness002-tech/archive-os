import { runtimeExecutionPipeline } from './runtime-execution-pipeline'
import { runtimeCompositionGraph } from './runtime-composition-graph'

export class ExecutableOperationalGraph {
  execute(nodeId: string) {
    const node = runtimeCompositionGraph.getNode(nodeId)

    if (!node) {
      return null
    }

    runtimeExecutionPipeline.enqueue({
      id: node.id,
      action: `execute:${node.type}`,
      status: 'pending',
    })

    return runtimeExecutionPipeline.execute()
  }

  topology() {
    return runtimeCompositionGraph.getTopology()
  }
}

export const executableOperationalGraph =
  new ExecutableOperationalGraph()
