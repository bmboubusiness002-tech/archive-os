export class StateEngine {
  private state = new Map<string, unknown>()

  set(key: string, value: unknown) {
    this.state.set(key, value)
  }

  get<T>(key: string): T {
    return this.state.get(key) as T
  }

  snapshot() {
    return Object.fromEntries(this.state.entries())
  }
}
