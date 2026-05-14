type RuntimeEvent = {
  id: string
  type: string
  domain: string
  timestamp: number
  payload: unknown
}

type EventHandler = (event: RuntimeEvent) => void

export class RuntimeEventBus {
  private handlers = new Map<string, EventHandler[]>()

  on(type: string, handler: EventHandler) {
    const current = this.handlers.get(type) ?? []
    current.push(handler)
    this.handlers.set(type, current)
  }

  off(type: string, handler: EventHandler) {
    const current = this.handlers.get(type) ?? []

    this.handlers.set(
      type,
      current.filter((candidate) => candidate !== handler),
    )
  }

  emit(event: RuntimeEvent) {
    const handlers = this.handlers.get(event.type) ?? []

    handlers.forEach((handler) => {
      handler(event)
    })
  }
}

export const runtimeEventBus = new RuntimeEventBus()
