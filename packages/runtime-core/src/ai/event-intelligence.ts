export interface RuntimeInsight {
  id: string
  event: string
  confidence: number
}

export class EventIntelligence {
  private insights: RuntimeInsight[] = []

  analyze(event: string) {
    const insight: RuntimeInsight = {
      id: crypto.randomUUID(),
      event,
      confidence: 0.95,
    }

    this.insights.unshift(insight)

    return insight
  }

  insightsFeed() {
    return this.insights
  }
}

export const eventIntelligence = new EventIntelligence()
