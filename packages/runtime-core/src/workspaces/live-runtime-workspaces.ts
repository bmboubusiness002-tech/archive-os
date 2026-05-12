export interface RuntimeWorkspaceSession {
  id: string
  workspace: string
  floatingPanels: string[]
  persisted: boolean
}

export class LiveRuntimeWorkspaces {
  private sessions: RuntimeWorkspaceSession[] = []

  activate(session: RuntimeWorkspaceSession) {
    this.sessions.push(session)
  }

  active() {
    return this.sessions
  }

  persist(sessionId: string) {
    const session = this.sessions.find((item) => item.id === sessionId)

    if (!session) {
      return null
    }

    session.persisted = true

    return session
  }
}

export const liveRuntimeWorkspaces = new LiveRuntimeWorkspaces()
