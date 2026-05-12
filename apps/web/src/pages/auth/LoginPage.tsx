export function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div>
          <h1 className="login-title">Archive OS</h1>
          <p className="login-subtitle">
            Enterprise ERP Platform for Operations, Inventory, POS, Finance, and RepairFlow.
          </p>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <h2>Sign in</h2>

          <form className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="admin@archive.local" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" />
            </div>

            <button type="submit" className="login-button">
              Access Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
