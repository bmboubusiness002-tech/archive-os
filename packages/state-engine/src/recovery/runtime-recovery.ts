export class RuntimeRecovery {
  hydrate(snapshot: unknown) {
    console.info('[recovery] hydrating runtime snapshot', snapshot)
  }

  restore(checkpoint: unknown) {
    console.info('[recovery] restoring runtime checkpoint', checkpoint)
  }

  reconstructOfflineState(payload: unknown) {
    console.info('[recovery] reconstructing offline runtime state', payload)
  }
}

export const runtimeRecovery = new RuntimeRecovery()
