import type { RuntimeEvent } from '../events/runtime-event'

export type EmitFn = (event: RuntimeEvent) => void
export type NavigateFn = (path: string) => void

export interface RuntimeContext {
  emit: EmitFn
  navigate: NavigateFn
}
