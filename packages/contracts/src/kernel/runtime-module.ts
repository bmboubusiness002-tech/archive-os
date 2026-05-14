import type { RuntimeContext } from './runtime-context'

export interface RuntimeModule {
  id: string
  name: string
  version: string

  register(context: RuntimeContext): void
  mount?(): void
  unmount?(): void
}
