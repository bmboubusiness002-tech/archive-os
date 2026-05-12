export interface RuntimeStorageRecord {
  id: string
  collection: string
  payload: Record<string, unknown>
  createdAt: number
}

export class RealDexieRuntimeStorage {
  private indexedCollections = new Map<string, RuntimeStorageRecord[]>()
  private replayStorage: RuntimeStorageRecord[] = []
  private offlineState = new Map<string, unknown>()

  schema(collection: string) {
    if (!this.indexedCollections.has(collection)) {
      this.indexedCollections.set(collection, [])
    }

    return collection
  }

  persist(record: RuntimeStorageRecord) {
    const collection = this.indexedCollections.get(record.collection) ?? []

    collection.push(record)

    this.indexedCollections.set(record.collection, collection)

    return record
  }

  repository(collection: string) {
    return this.indexedCollections.get(collection) ?? []
  }

  replay(record: RuntimeStorageRecord) {
    this.replayStorage.push(record)
  }

  hydrateOfflineState(key: string, value: unknown) {
    this.offlineState.set(key, value)
  }
}

export const realDexieRuntimeStorage =
  new RealDexieRuntimeStorage()
