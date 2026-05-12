export class RuntimeServices {
  private services = new Map<string, unknown>()

  register<T>(key: string, service: T) {
    this.services.set(key, service)
  }

  resolve<T>(key: string): T {
    return this.services.get(key) as T
  }
}
