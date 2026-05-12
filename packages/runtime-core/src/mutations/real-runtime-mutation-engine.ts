export class RealRuntimeMutationEngine {
  entityMutation(entityId: string) {
    return {
      entityId,
      mutation: 'entity-runtime-mutation',
      mutatedAt: Date.now(),
    }
  }

  graphMutation(node: string) {
    return {
      node,
      mutation: 'graph-runtime-mutation',
      mutatedAt: Date.now(),
    }
  }

  stateMutation(state: string) {
    return {
      state,
      mutation: 'state-runtime-mutation',
      mutatedAt: Date.now(),
    }
  }

  workflowMutation(workflow: string) {
    return {
      workflow,
      mutation: 'workflow-runtime-mutation',
      mutatedAt: Date.now(),
    }
  }

  replayMutation(replay: string) {
    return {
      replay,
      mutation: 'replay-runtime-mutation',
      mutatedAt: Date.now(),
    }
  }
}

export const realRuntimeMutationEngine =
  new RealRuntimeMutationEngine()
