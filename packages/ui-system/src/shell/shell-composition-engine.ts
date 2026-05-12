export interface ShellPanel {
  id: string
  title: string
}

export class ShellCompositionEngine {
  private panels: ShellPanel[] = []

  compose(panel: ShellPanel) {
    this.panels.push(panel)
  }

  structure() {
    return this.panels
  }
}

export const shellCompositionEngine = new ShellCompositionEngine()
