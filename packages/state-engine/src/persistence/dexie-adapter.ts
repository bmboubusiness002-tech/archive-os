export class DexieAdapter {
  async connect() {
    console.info('[dexie] persistence adapter initialized')
  }

  async save(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async load<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(key)

    return value ? (JSON.parse(value) as T) : null
  }
}
