export interface OperationalMemoryRecord {
  id: string
  category: string
  createdAt: number
}

export class OperationalMemoryIndex {
  private records: OperationalMemoryRecord[] = []

  index(record: OperationalMemoryRecord) {
    this.records.unshift(record)
  }

  search(category: string) {
    return this.records.filter((record) => record.category === category)
  }
}

export const operationalMemoryIndex = new OperationalMemoryIndex()
