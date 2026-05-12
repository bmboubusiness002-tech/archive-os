export interface RuntimeTelemetrySignal {
  id: string
  source: string
  metric: string
  value: number
  timestamp: number
}

export class RuntimeOperationalTelemetry {
  private signals: RuntimeTelemetrySignal[] = []

  ingest(signal: RuntimeTelemetrySignal) {
    this.signals.unshift(signal)
  }

  stream() {
    return this.signals
  }

  inspect(source: string) {
    return this.signals.filter((signal) => signal.source === source)
  }
}

export const runtimeOperationalTelemetry =
  new RuntimeOperationalTelemetry()
