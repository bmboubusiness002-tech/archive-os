export interface MaterializedRuntimeState {
  dexie: boolean
  replay: boolean
  archive: boolean
  workspaces: boolean
  telemetry: boolean
}

export class RuntimeStateMaterialization {
  materialize(): MaterializedRuntimeState {
    return {
      dexie: true,
      replay: true,
      archive: true,
      workspaces: true,
      telemetry: true,
    }
  }
}

export const runtimeStateMaterialization =
  new RuntimeStateMaterialization()
