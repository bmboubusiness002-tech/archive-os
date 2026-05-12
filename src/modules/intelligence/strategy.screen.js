// Strategy Advisor — rules-based recommendations from real DB state.
import { db } from "../pos/pos.db.js";
import { fmtMoney, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

export async function renderStrategy(view) {
  const [products, stock, sales, items] = await Promise.all([
    db.products.toArray(),
    db.stock_balance.toArray(),
    db.sales.toArray(),
    db.sale_items.toArray(),
  ]);

  const stockMap = {};
  stock.forEach(s => stockMap[s.productId] = s.qty);

  // Item frequency
  const sold = {};
  items.forEach(i => sold[i.productId] = (sold[i.productId] || 0) + i.qty);

  const insights = [];

  // Low stock
  const low = products.filter(p => (stockMap[p.id] || 0) < 5);
  low.forEach(p => insights.push({
    level: "warn",
    icon: "⚠️",
    title: `Restock "${p.name}"`,
    body: `Only ${stockMap[p.id] || 0} units left. Reorder before stock-out.`
  }));

  // Dead stock
  products.forEach(p => {
    if (!sold[p.id] && (stockMap[p.id] || 0) > 10) {
      insights.push({
        level: "info",
        icon: "💤",
        title: `Slow mover: "${p.name}"`,
        body: `${stockMap[p.id]} units in stock with no sales yet. Consider promotion or bundle.`
      });
    }
  });

  // Best seller pricing
  const bestList = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 3);
  bestList.forEach(([pid, qty]) => {
    const p = products.find(x => x.id === Number(pid));
    if (!p) return;
    const margin = ((p.price - (p.cost || 0)) / p.price) * 100;
    if (margin < 25) insights.push({
      level: "warn",
      icon: "📈",
      title: `Increase margin on "${p.name}"`,
      body: `Best seller (${qty} units) but margin is only ${margin.toFixed(1)}%. Test +5% price.`
    });
  });

  // Sales velocity
  if (sales.length >= 3) {
    const last3 = sales.slice(-3).reduce((s, x) => s + x.total, 0) / 3;
    const all   = sales.reduce((s, x) => s + x.total, 0) / sales.length;
    if (last3 > all * 1.2) insights.push({
      level: "good", icon: "🚀",
      title: "Sales accelerating",
      body: `Recent average (${fmtMoney(last3)}) is ${((last3 / all - 1) * 100).toFixed(0)}% above the long-term average. Increase stock buffer.`
    });
    if (last3 < all * 0.8) insights.push({
      level: "warn", icon: "📉",
      title: "Sales slowing down",
      body: `Recent average (${fmtMoney(last3)}) is below historic average. Consider promotion.`
    });
  }

  if (!insights.length) insights.push({
    level: "good", icon: "✅",
    title: "All clear",
    body: "No urgent recommendations right now. Keep monitoring."
  });

  const colors = { warn: "#fbbf24", info: "#22d3ee", good: "#4ade80" };

  view.innerHTML = `
    ${statsBar([
      { label: "Products tracked", value: products.length },
      { label: "Insights",         value: insights.length, color: "#3b82f6" },
      { label: "Low stock",        value: low.length, color: low.length ? "#fbbf24" : "#4ade80" },
      { label: "Sales analysed",   value: sales.length },
    ])}

    ${panel("Recommendations", insights.length ? `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${insights.map(i => `
          <div style="background:#1e293b;border-left:3px solid ${colors[i.level]};padding:12px 14px;border-radius:8px;">
            <div style="display:flex;align-items:center;gap:8px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">
              <span>${i.icon}</span><span>${escapeHtml(i.title)}</span>
            </div>
            <div style="font-size:12px;color:#94a3b8;">${escapeHtml(i.body)}</div>
          </div>
        `).join("")}
      </div>
    ` : emptyState("No recommendations."))}
  `;
}
