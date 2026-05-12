export interface RuntimeEvent<T = unknown> {
  type: string
  payload: T
  timestamp: number
}
