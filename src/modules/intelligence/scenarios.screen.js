// Scenario Simulation — interactive what-if calculator.
import { db } from "../pos/pos.db.js";
import { fmtMoney, panel } from "../_shared/ui.js";

export async function renderScenarios(view) {
  const sales = await db.sales.toArray();
  const baseRevenue = sales.reduce((s, x) => s + x.total, 0);
  const baseCount   = sales.length || 1;
  const avgTicket   = baseRevenue / baseCount;

  view.innerHTML = `
    ${panel("Inputs", `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;">
        ${slider("priceChange", "Price change %",      -50, 50, 0)}
        ${slider("trafficChange", "Customer traffic %", -50, 100, 0)}
        ${slider("costChange", "Cost change %",        -30, 50, 0)}
        ${slider("conversion", "Conversion rate %",     50, 150, 100)}
      </div>
    `)}
    <div id="scenario-out"></div>
  `;

  const sliders = view.querySelectorAll("input[type=range]");
  sliders.forEach(s => s.oninput = () => {
    s.parentNode.querySelector(".val").textContent = s.value + "%";
    recompute();
  });

  function recompute() {
    const get = (n) => Number(view.querySelector(`[name=${n}]`).value);
    const p = get("priceChange"), t = get("trafficChange"),
          c = get("costChange"), conv = get("conversion");

    const newAvg     = avgTicket * (1 + p / 100);
    const newCount   = baseCount * (1 + t / 100) * (conv / 100);
    const newRevenue = newAvg * newCount;
    const grossMarginAssumed = 0.4;
    const baseProfit = baseRevenue * grossMarginAssumed;
    const newCost    = (baseRevenue * (1 - grossMarginAssumed)) * (1 + c / 100) * (1 + t / 100) * (conv / 100);
    const newProfit  = newRevenue - newCost;

    const delta = (a, b) => {
      const diff = b - a;
      const pct = a === 0 ? 0 : (diff / a) * 100;
      const color = diff >= 0 ? "#4ade80" : "#f87171";
      return `<span style="color:${color};font-size:12px;">(${diff >= 0 ? "+" : ""}${pct.toFixed(1)}%)</span>`;
    };

    view.querySelector("#scenario-out").innerHTML = panel("Projected outcome", `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;">
        ${kpi("Revenue", fmtMoney(newRevenue), delta(baseRevenue, newRevenue))}
        ${kpi("Profit (est.)", fmtMoney(newProfit), delta(baseProfit, newProfit))}
        ${kpi("Avg ticket",  fmtMoney(newAvg), delta(avgTicket, newAvg))}
        ${kpi("Transactions", Math.round(newCount), delta(baseCount, newCount))}
      </div>
      <div style="margin-top:14px;font-size:11px;color:#64748b;">
        Baseline taken from current DB: ${baseCount} sale(s), ${fmtMoney(baseRevenue)} revenue.
        Margin assumption: 40%.
      </div>
    `);
  }

  recompute();
}

function slider(name, label, min, max, val) {
  return `
    <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#94a3b8;">
      <span style="display:flex;justify-content:space-between;">
        <span>${label}</span><span class="val" style="color:#f1f5f9;">${val}%</span>
      </span>
      <input type="range" name="${name}" min="${min}" max="${max}" value="${val}" />
    </label>
  `;
}

function kpi(label, value, delta) {
  return `
    <div style="background:#1e293b;border-radius:8px;padding:14px;">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
      <div style="font-size:22px;font-weight:700;color:#f1f5f9;margin-top:4px;">${value}</div>
      <div>${delta}</div>
    </div>
  `;
}
