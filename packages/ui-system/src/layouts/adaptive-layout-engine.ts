export interface AdaptiveLayoutZone {
  id: string
  widgets: string[]
}

export class AdaptiveLayoutEngine {
  private zones: AdaptiveLayoutZone[] = []

  register(zone: AdaptiveLayoutZone) {
    this.zones.push(zone)
  }

  zonesState() {
    return this.zones
  }
}

export const adaptiveLayoutEngine = new AdaptiveLayoutEngine()
