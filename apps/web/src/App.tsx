import { useState } from 'react'
import { LoginPage } from './pages/auth/LoginPage'

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
          <button>Command Center</button>
          <button>Predictive Analytics</button>
          <button>Strategy Advisor</button>
          <span className="workspace-nav-section">Operations</span>
          <button>POS</button>
          <button>Inventory</button>
          <button>RepairFlow</button>
          <button>Finance</button>
          <button>Customers</button>
        </nav>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div>
            <p>Welcome back</p>
            <h1>Business Command Center</h1>
          </div>
          <button className="workspace-logout" onClick={() => setAuthenticated(false)}>
            Sign out
          </button>
        </header>

        <div className="workspace-grid">
          <article className="workspace-card workspace-card-large">
            <span>Today</span>
            <h2>Operations pulse is ready</h2>
            <p>POS, inventory, repair tickets, finance signals, and customer activity will be connected here as real modules are built.</p>
          </article>
          <article className="workspace-card">
            <span>Inventory</span>
            <strong>400</strong>
            <p>Units tracked</p>
          </article>
          <article className="workspace-card">
            <span>Finance</span>
            <strong>0.00</strong>
            <p>Net cash</p>
          </article>
          <article className="workspace-card">
            <span>RepairFlow</span>
            <strong>Ready</strong>
            <p>Ticket system prepared</p>
          </article>
        </div>
      </section>
    </main>
  )
}
