const kpis = [
  { label: 'Revenue', value: '0.00', hint: 'Sales collected today', tone: 'cyan' },
  { label: 'Profit', value: '0.00', hint: 'Estimated net profit', tone: 'violet' },
  { label: 'Cash', value: '0.00', hint: 'Cash and bank position', tone: 'green' },
  { label: 'Inventory value', value: '2,900.00', hint: 'Cost value across 8 SKUs', tone: 'blue' },
]

const intelligenceSignals = [
  {
    title: 'Slow-moving inventory detected',
    body: '8 products have stock but no sales yet. Consider bundles, promotions, or price tests.',
    status: 'Strategy',
  },
  {
    title: 'Financial state healthy',
    body: 'No expenses, debts, or cash risks have been recorded in the current demo dataset.',
    status: 'Finance',
  },
  {
    title: 'Repair capacity available',
    body: 'No active repair tickets. Technician workload is clear and ready for new intake.',
    status: 'RepairFlow',
  },
]

const operations = [
  { label: 'POS session', value: 'Closed', meta: 'Open a session before processing sales' },
  { label: 'Products tracked', value: '8', meta: '400 units in stock' },
  { label: 'Low stock', value: '0', meta: 'Inventory health is stable' },
  { label: 'Repair tickets', value: '0', meta: 'No open or awaiting-parts tickets' },
  { label: 'Customers', value: '0', meta: 'CRM is ready for first customer' },
  { label: 'Employees', value: '0', meta: 'HR records not configured yet' },
]

const activity = [
  'Inventory seed loaded with 8 products and 400 stock units.',
  'Chart of accounts initialized with 10 accounts.',
  'Smart pricing identified discount opportunities for stale stock.',
  'Repair spare-parts catalog is ready with 8 SKUs.',
]

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">Overview · Command Center</span>
          <h2>Business intelligence starts here.</h2>
          <p>
            BMBOU ERP reads sales, inventory, finance, repair, customers, HR, and admin data to show the operational health of the business from one place.
          </p>
        </div>
        <div className="dashboard-hero-badge">
          <span className="pulse-dot" />
          System stable
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        {kpis.map((kpi) => (
          <article className={`dashboard-kpi dashboard-kpi-${kpi.tone}`} key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.hint}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-layout-grid">
        <article className="dashboard-panel dashboard-panel-large">
          <div className="panel-header">
            <div>
              <span>AI Signals</span>
              <h3>Strategy Advisor</h3>
            </div>
            <button>Review signals</button>
          </div>

          <div className="signal-list">
            {intelligenceSignals.map((signal) => (
              <div className="signal-card" key={signal.title}>
                <small>{signal.status}</small>
                <h4>{signal.title}</h4>
                <p>{signal.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header compact">
            <div>
              <span>Predictive Analytics</span>
              <h3>Forecast readiness</h3>
            </div>
          </div>
          <div className="forecast-meter">
            <strong>Not enough sales data</strong>
            <p>Complete sales in POS to activate revenue forecasts, demand prediction, and scenario simulation.</p>
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel-large">
          <div className="panel-header">
            <div>
              <span>Live Operations</span>
              <h3>Operational modules</h3>
            </div>
            <button>Open module</button>
          </div>

          <div className="operations-grid">
            {operations.map((item) => (
              <div className="operation-tile" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.meta}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header compact">
            <div>
              <span>Activity Timeline</span>
              <h3>Recent system events</h3>
            </div>
          </div>
          <div className="activity-list">
            {activity.map((event) => (
              <div className="activity-item" key={event}>
                <span />
                <p>{event}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
