import { ACCOUNTS } from "../../core/ledger/ledger-engine.js"

// ----------------------
// Cash Flow Analysis
// ----------------------
export function analyzeCashFlow(entries) {
  let cashIn = 0
  let cashOut = 0

  for (const e of entries) {
    if (e.debitAccount === ACCOUNTS.CASH) {
      cashIn += e.amount
    }

    if (e.creditAccount === ACCOUNTS.CASH) {
      cashOut += e.amount
    }
  }

  return {
    cashIn,
    cashOut,
    net: cashIn - cashOut
  }
}

// ----------------------
// Alerts Engine
// ----------------------
export function generateAlerts({ cash, revenue, expense }) {
  const alerts = []

  if (cash < 0) {
    alerts.push({
      type: "danger",
      msg: "⚠️ Cash is NEGATIVE (Liquidity risk)"
    })
  }

  if (expense > revenue) {
    alerts.push({
      type: "danger",
      msg: "⚠️ Expenses exceed Revenue"
    })
  }

  const burn = expense - revenue
  if (burn > 0) {
    alerts.push({
      type: "warning",
      msg: `🔥 Burn Rate: ${burn}`
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "good",
      msg: "✅ System Healthy"
    })
  }

  return alerts
}
