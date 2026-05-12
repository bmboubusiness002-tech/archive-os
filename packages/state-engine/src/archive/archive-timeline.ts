export interface ArchiveTimelineEntry {
  id: string
  timestamp: number
  event: string
}

export class ArchiveTimeline {
  private entries: ArchiveTimelineEntry[] = []

  append(entry: ArchiveTimelineEntry) {
    this.entries.unshift(entry)
  }

  history() {
    return this.entries
  }
}

export const archiveTimeline = new ArchiveTimeline()
