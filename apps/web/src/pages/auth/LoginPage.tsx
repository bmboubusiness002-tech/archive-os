export function LoginPage() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.alert('Demo login accepted. Workspace routing will be connected next.')
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-orb login-orb-primary" />
        <div className="login-orb login-orb-secondary" />

        <div className="login-brand">
          <div className="brand-mark">A</div>
          <div>
            <p className="eyebrow">Archive OS · ERP v2026</p>
            <h1>Operate POS, inventory, finance, CRM, and RepairFlow from one command center.</h1>
            <p className="hero-copy">
              A modern enterprise workspace designed for real operational teams, live workflows,
              branch control, stock movement, service tickets, and financial visibility.
            </p>
          </div>
        </div>

        <div className="hero-grid">
          <div className="metric-card">
            <span>Live modules</span>
            <strong>12</strong>
            <small>POS · Stock · CRM · Repair</small>
          </div>
          <div className="metric-card metric-card-glow">
            <span>System mode</span>
            <strong>Cloud</strong>
            <small>Codespaces-ready workspace</small>
          </div>
          <div className="metric-card">
            <span>Build phase</span>
            <strong>UI/UX</strong>
            <small>Enterprise shell in progress</small>
          </div>
        </div>
      </section>

      <section className="login-panel-wrap">
        <div className="login-card">
          <div className="login-card-header">
            <p className="eyebrow">Secure access</p>
            <h2>Sign in to workspace</h2>
            <p>Use the demo credentials below while authentication is being connected.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email address</span>
              <input type="email" defaultValue="admin@archive.local" autoComplete="email" />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" defaultValue="archive2026" autoComplete="current-password" />
            </label>

            <div className="form-row">
              <label className="remember-row">
                <input type="checkbox" defaultChecked />
                <span>Keep me signed in</span>
              </label>
              <button type="button" className="link-button">Forgot password?</button>
            </div>

            <button className="primary-button" type="submit">
              Access ERP Workspace
              <span>→</span>
            </button>
          </form>

          <div className="security-note">
            <span className="pulse-dot" />
            Demo mode active. RBAC, JWT sessions, and branch permissions come next.
          </div>
        </div>
      </section>
    </main>
  )
}
