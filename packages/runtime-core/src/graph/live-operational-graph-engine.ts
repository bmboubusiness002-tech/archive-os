export interface RuntimeGraphRelation {
  source: string
  target: string
  relation: string
}

export class LiveOperationalGraphEngine {
  private relations: RuntimeGraphRelation[] = []

  mutate(relation: RuntimeGraphRelation) {
    this.relations.push(relation)

    return {
      mutation: 'graph-runtime-mutation',
      relation,
    }
  }

  operationalTopology() {
    return this.relations
  }

  entityRelations(entity: string) {
    return this.relations.filter(
      (relation) =>
        relation.source === entity || relation.target === entity,
    )
  }

  workflowTopology(workflow: string) {
    return {
      workflow,
      topology: 'workflow-runtime-topology',
      generatedAt: Date.now(),
    }
  }

  synchronize() {
    return {
      synchronization: 'runtime-graph-synchronization',
      synchronizedAt: Date.now(),
    }
  }
}

export const liveOperationalGraphEngine =
  new LiveOperationalGraphEngine()
