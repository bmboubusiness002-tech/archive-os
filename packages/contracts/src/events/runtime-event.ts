export interface RuntimeEvent<T = unknown> {
  id: string
  type: string
  domain: string
  timestamp: number
  payload: T
}
