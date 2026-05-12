export function LoginPage() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.alert('BMBOU ERP demo access accepted. Workspace routing will be connected next.')
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-orb login-orb-primary" />
        <div className="login-orb login-orb-secondary" />

        <div className="language-switcher" aria-label="Language selector">
          <button className="language-option language-option-active">العربية</button>
          <button className="language-option">English</button>
          <button className="language-option">Français</button>
        </div>

        <div className="login-brand">
          <div className="brand-mark">B</div>
          <div>
            <p className="eyebrow">BMBOU ERP · Business Operating System</p>
            <h1>منصة موحدة لإدارة المبيعات، المخزون، الصيانة، المالية، العملاء والموظفين.</h1>
            <p className="hero-copy">
              BMBOU ERP يمنح فرق العمل مركز تحكم احترافي لإدارة نقاط البيع، حركة المخزون،
              العملاء، تذاكر الإصلاح، الفوترة، التقارير المالية، الموارد البشرية، والتحليلات الذكية
              من واجهة واحدة قابلة للتوسع.
            </p>
          </div>
        </div>

        <div className="feature-showcase">
          <div className="feature-pill">POS</div>
          <div className="feature-pill">Inventory</div>
          <div className="feature-pill">CRM</div>
          <div className="feature-pill">RepairFlow</div>
          <div className="feature-pill">Finance</div>
          <div className="feature-pill">HRM</div>
          <div className="feature-pill">Analytics</div>
          <div className="feature-pill">Multi-language</div>
        </div>

        <div className="hero-grid">
          <div className="metric-card">
            <span>Operational modules</span>
            <strong>12+</strong>
            <small>POS · Stock · CRM · HR · Repair</small>
          </div>
          <div className="metric-card metric-card-glow">
            <span>Languages</span>
            <strong>AR · EN · FR</strong>
            <small>واجهة متعددة اللغات للشركات الحديثة</small>
          </div>
          <div className="metric-card">
            <span>Intelligence layer</span>
            <strong>AI-ready</strong>
            <small>Pricing · Forecasts · Strategy signals</small>
          </div>
        </div>
      </section>

      <section className="login-panel-wrap">
        <div className="login-card">
          <div className="login-card-header">
            <p className="eyebrow">Secure business access</p>
            <h2>تسجيل الدخول إلى BMBOU ERP</h2>
            <p>ادخل إلى مساحة العمل لإدارة العمليات اليومية، التقارير، المبيعات، المخزون والصيانة.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email address</span>
              <input type="email" defaultValue="admin@bmbou.local" autoComplete="email" />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" defaultValue="bmbou2026" autoComplete="current-password" />
            </label>

            <div className="form-row">
              <label className="remember-row">
                <input type="checkbox" defaultChecked />
                <span>تذكرني</span>
              </label>
              <button type="button" className="link-button">نسيت كلمة المرور؟</button>
            </div>

            <button className="primary-button" type="submit">
              دخول منصة BMBOU ERP
              <span>→</span>
            </button>
          </form>

          <div className="security-note">
            <span className="pulse-dot" />
            Demo mode active. Next: real auth, roles, branch permissions, and language persistence.
          </div>
        </div>
      </section>
    </main>
  )
}
