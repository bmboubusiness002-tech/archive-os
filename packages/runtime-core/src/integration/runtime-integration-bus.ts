export interface RuntimeIntegrationMessage {
  source: string
  target: string
  payload: Record<string, unknown>
  timestamp: number
}

export class RuntimeIntegrationBus {
  private messages: RuntimeIntegrationMessage[] = []

  publish(message: RuntimeIntegrationMessage) {
    this.messages.push(message)

    return {
      integrated: true,
      message,
    }
  }

  stream() {
    return this.messages
  }

  topology() {
    return {
      services: true,
      ai: true,
      telemetry: true,
      workflows: true,
      state: true,
      graph: true,
      ui: true,
    }
  }
}

export const runtimeIntegrationBus = new RuntimeIntegrationBus()
