import type { RuntimeEvent } from '../contracts/runtime-event'

type Listener<T = unknown> = (event: RuntimeEvent<T>) => void

export class EventBus {
  private listeners = new Map<string, Listener[]>()

  emit<T>(event: RuntimeEvent<T>) {
    const listeners = this.listeners.get(event.type) || []

    listeners.forEach((listener) => listener(event))
  }

  on<T>(type: string, listener: Listener<T>) {
    const listeners = this.listeners.get(type) || []

    listeners.push(listener as Listener)

    this.listeners.set(type, listeners)
  }
}
