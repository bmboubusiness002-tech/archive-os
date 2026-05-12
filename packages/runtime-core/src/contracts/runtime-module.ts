export interface RuntimeModule {
  id: string
  name: string
  version: string

  mount(): Promise<void>
  unmount(): Promise<void>
}
