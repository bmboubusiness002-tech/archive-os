import { workflowOrchestrator } from '../ai/workflow-orchestrator'

export interface RuntimeExecutionTask {
  id: string
  workflow: string
  status: 'pending' | 'running' | 'completed'
}

export class RuntimeExecutionEngine {
  private tasks: RuntimeExecutionTask[] = []

  execute(workflow: string) {
    const orchestration = workflowOrchestrator.suggest(workflow)

    const task: RuntimeExecutionTask = {
      id: crypto.randomUUID(),
      workflow,
      status: 'running',
    }

    this.tasks.unshift(task)

    return {
      orchestration,
      task,
    }
  }

  queue() {
    return this.tasks
  }
}

export const runtimeExecutionEngine = new RuntimeExecutionEngine()
