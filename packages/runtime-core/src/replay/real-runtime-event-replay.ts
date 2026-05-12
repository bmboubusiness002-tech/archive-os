export interface RuntimeReplayEvent {
  id: string
  type: string
  payload: Record<string, unknown>
  timestamp: number
}

export class RealRuntimeEventReplay {
  private events: RuntimeReplayEvent[] = []

  append(event: RuntimeReplayEvent) {
    this.events.push(event)
  }

  replay() {
    return this.events.sort((a, b) => a.timestamp - b.timestamp)
  }

  reconstruct() {
    return {
      events: this.events.length,
      reconstructedAt: Date.now(),
    }
  }

  recoverTimeline(entityId: string) {
    return this.events.filter((event) => event.id === entityId)
  }
}

export const realRuntimeEventReplay = new RealRuntimeEventReplay()
