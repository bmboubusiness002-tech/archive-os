// Predictive Analytics — forecast next period from recent sales trend.
import { db } from "../pos/pos.db.js";
import { fmtMoney, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderPredictive(view) {
  const sales = await db.sales.orderBy("createdAt").toArray();

  if (!sales.length) {
    view.innerHTML = panel("Predictive Analytics", emptyState("Not enough sales data yet. Make a few sales in POS to see forecasts."));
    return;
  }

  // Group by day
  const byDay = {};
  for (const s of sales) {
    const k = new Date(s.createdAt).toISOString().slice(0, 10);
    byDay[k] = (byDay[k] || 0) + s.total;
  }
  const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
  const totals = days.map(d => d[1]);
  const avg = totals.reduce((s, v) => s + v, 0) / totals.length;

  // Simple linear trend
  const n = totals.length;
  const xMean = (n - 1) / 2;
  const yMean = avg;
  let num = 0, den = 0;
  totals.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  const forecast7 = Array.from({ length: 7 }, (_, i) => Math.max(0, intercept + slope * (n + i)));
  const forecastTotal = forecast7.reduce((s, v) => s + v, 0);

  // Top products (by units) from sale_items
  const items = await db.sale_items.toArray();
  const byProd = {};
  for (const it of items) {
    byProd[it.name] = (byProd[it.name] || 0) + it.qty;
  }
  const top = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const max = Math.max(...totals, ...forecast7, 1);
  const bar = (v, color) => `<div style="background:${color};height:${(v / max) * 80}px;width:18px;border-radius:3px 3px 0 0;" title="${fmtMoney(v)}"></div>`;

  view.innerHTML = `
    ${statsBar([
      { label: "Sales recorded", value: sales.length },
      { label: "Avg / day",      value: fmtMoney(avg) },
      { label: "Trend",          value: (slope >= 0 ? "▲ " : "▼ ") + fmtMoney(Math.abs(slope)) + "/day", color: slope >= 0 ? "#4ade80" : "#f87171" },
      { label: "Next 7-day forecast", value: fmtMoney(forecastTotal), color: "#3b82f6" },
    ])}

    ${panel("Sales trend (history → forecast)", `
      <div style="display:flex;align-items:flex-end;gap:6px;height:100px;border-bottom:1px solid #1e293b;padding-bottom:6px;">
        ${totals.map(v => bar(v, "#22d3ee")).join("")}
        <div style="width:1px;background:#475569;height:80px;margin:0 4px;"></div>
        ${forecast7.map(v => bar(v, "#3b82f6")).join("")}
      </div>
      <div style="display:flex;gap:14px;margin-top:8px;font-size:11px;color:#64748b;">
        <span><span style="display:inline-block;width:10px;height:10px;background:#22d3ee;border-radius:2px;"></span> Actual (${days.length} days)</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:2px;"></span> Forecast (next 7 days)</span>
      </div>
    `)}

    ${panel("Top selling products", top.length ? `
      <table>
        <thead><tr><th>#</th><th>Product</th><th>Units sold</th></tr></thead>
        <tbody>${top.map(([name, qty], i) => `
          <tr><td>${i + 1}</td><td>${escapeHtml(name)}</td><td><b>${qty}</b></td></tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No item data."))}
  `;
}
