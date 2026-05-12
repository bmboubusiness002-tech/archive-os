import { useState } from 'react'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />
  }

  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-logo">BMBOU ERP</div>

        <nav className="workspace-nav">
          <span className="workspace-nav-section">Intelligence</span>
          <button className="workspace-nav-active">Overview</button>
          <button>Predictive Analytics</button>
          <button>Strategy Advisor</button>
          <button>Scenario Simulation</button>

          <span className="workspace-nav-section">Operations</span>
          <button>POS</button>
          <button>Sales</button>
          <button>Inventory</button>
          <button>RepairFlow</button>
          <button>Finance</button>
          <button>CRM</button>
          <button>HR</button>
        </nav>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div>
            <p>Welcome back</p>
            <h1>BMBOU ERP Command Center</h1>
          </div>

          <div className="workspace-topbar-actions">
            <button className="workspace-action-button">Global Search</button>
            <button className="workspace-action-button">AI Assistant</button>
            <button className="workspace-logout" onClick={() => setAuthenticated(false)}>
              Sign out
            </button>
          </div>
        </header>

        <DashboardPage />
      </section>
    </main>
  )
}
