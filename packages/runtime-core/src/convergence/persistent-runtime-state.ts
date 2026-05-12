export interface RuntimeStateSnapshot {
  id: string
  telemetry: unknown[]
  workspaces: unknown[]
  replayState: unknown[]
  archivedState: unknown[]
}

export class PersistentRuntimeState {
  private snapshots: RuntimeStateSnapshot[] = []

  save(snapshot: RuntimeStateSnapshot) {
    this.snapshots.unshift(snapshot)
  }

  restore(snapshotId: string) {
    return this.snapshots.find((snapshot) => snapshot.id === snapshotId)
  }

  recover(snapshotId: string) {
    const snapshot = this.restore(snapshotId)

    return snapshot?.replayState || []
  }
}

export const persistentRuntimeState = new PersistentRuntimeState()
