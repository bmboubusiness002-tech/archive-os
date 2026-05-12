export interface RuntimeNavigationItem {
  id: string
  label: string
  route: string
  icon?: string
}

export class RuntimeNavigation {
  private items: RuntimeNavigationItem[] = []

  register(item: RuntimeNavigationItem) {
    this.items.push(item)
  }

  list() {
    return this.items
  }
}

export const runtimeNavigation = new RuntimeNavigation()
