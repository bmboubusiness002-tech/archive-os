export type RuntimeOperationalEvent = {
  id: string
  channel: string
  type: string
  payload: Record<string, unknown>
  timestamp: number
}

export class RuntimeOperationalEventBus {
  private listeners = new Map<string, Array<(event: RuntimeOperationalEvent) => void>>()

  publish(event: RuntimeOperationalEvent) {
    const channelListeners = this.listeners.get(event.channel) ?? []

    for (const listener of channelListeners) {
      listener(event)
    }
  }

  subscribe(channel: string, listener: (event: RuntimeOperationalEvent) => void) {
    const listeners = this.listeners.get(channel) ?? []
    listeners.push(listener)
    this.listeners.set(channel, listeners)
  }
}

export const runtimeOperationalEventBus = new RuntimeOperationalEventBus()
