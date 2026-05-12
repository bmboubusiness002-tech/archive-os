export class RuntimeTimeMachine {
  restore(snapshot: unknown) {
    console.info('[archive] restoring runtime snapshot', snapshot)
  }

  checkpoint() {
    return {
      createdAt: Date.now(),
    }
  }
}

export const runtimeTimeMachine = new RuntimeTimeMachine()
