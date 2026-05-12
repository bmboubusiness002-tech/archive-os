import { runtimeTelemetry } from '../telemetry/runtime-telemetry'
import { operationalKnowledgeGraph } from '../knowledge/operational-knowledge-graph'
import { runtimeIntelligenceEngine } from '../intelligence/runtime-intelligence-engine'

export class RuntimeGraphWiring {
  wireTelemetry(entityId: string, metric: number) {
    runtimeTelemetry.publish({
      key: `graph.metric.${entityId}`,
      value: metric,
      timestamp: Date.now(),
    })

    operationalKnowledgeGraph.register({
      id: entityId,
      type: 'telemetry',
      relations: ['runtime-metric'],
    })
  }

  wireWorkflow(moduleId: string) {
    return runtimeIntelligenceEngine.predictWorkflow(moduleId)
  }

  wireOperationalRelation(source: string, target: string) {
    operationalKnowledgeGraph.register({
      id: source,
      type: 'runtime-relation',
      relations: [target],
    })
  }
}

export const runtimeGraphWiring = new RuntimeGraphWiring()
