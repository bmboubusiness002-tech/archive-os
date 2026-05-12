export interface RuntimeMetric {
  key: string
  value: number
  timestamp: number
}

export class RuntimeTelemetry {
  private metrics: RuntimeMetric[] = []

  publish(metric: RuntimeMetric) {
    this.metrics.unshift(metric)
  }

  stream() {
    return this.metrics
  }
}

export const runtimeTelemetry = new RuntimeTelemetry()
