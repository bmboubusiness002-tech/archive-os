import { runtimeTelemetry } from '../telemetry/runtime-telemetry'

export interface RuntimeHydrationSnapshot {
  workspaces: string[]
  layouts: string[]
  timestamp: number
}

export class RuntimeHydrationEngine {
  private snapshot: RuntimeHydrationSnapshot | null = null

  restore(snapshot: RuntimeHydrationSnapshot) {
    this.snapshot = snapshot

    runtimeTelemetry.publish({
      key: 'runtime.hydrated',
      value: snapshot.workspaces.length,
      timestamp: Date.now(),
    })
  }

  current() {
    return this.snapshot
  }
}

export const runtimeHydrationEngine = new RuntimeHydrationEngine()
