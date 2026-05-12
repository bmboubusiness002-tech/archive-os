export interface CognitiveWidget {
  id: string
  context: string
  predictive: boolean
}

export class CognitiveOperationalUI {
  private widgets: CognitiveWidget[] = []

  compose(widget: CognitiveWidget) {
    this.widgets.push(widget)
  }

  adaptiveLayout(context: string) {
    return {
      context,
      widgets: this.widgets.filter((widget) => widget.context === context),
    }
  }

  predictiveComposition() {
    return this.widgets.filter((widget) => widget.predictive)
  }
}

export const cognitiveOperationalUI = new CognitiveOperationalUI()
