import { eventIntelligence } from './event-intelligence'

export class WorkflowOrchestrator {
  suggest(event: string) {
    return eventIntelligence.analyze(event)
  }

  route(moduleId: string) {
    return {
      moduleId,
      routedAt: Date.now(),
    }
  }
}

export const workflowOrchestrator = new WorkflowOrchestrator()
