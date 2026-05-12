// Sales / Inventory / Financial reports — all read-only analytics from existing tables.
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";

// ============ SALES REPORTS ============
export async function renderSalesReport(view) {
  const [sales, items, products] = await Promise.all([
    db.sales.toArray(), db.sale_items.toArray(), db.products.toArray()
  ]);
  const pIdx = Object.fromEntries(products.map(p => [p.id, p]));

  const totalRev = sales.reduce((s, x) => s + (x.total || 0), 0);
  const avgTicket = sales.length ? totalRev / sales.length : 0;
  const totalUnits = items.reduce((s, i) => s + i.qty, 0);

  // By day
  const byDay = {};
  sales.forEach(s => {
    const d = new Date(s.createdAt).toISOString().slice(0, 10);
    byDay[d] = (byDay[d] || 0) + (s.total || 0);
  });
  const days = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);

  // Top products
  const byProd = {};
  items.forEach(i => {
    const k = i.productId;
    if (!byProd[k]) byProd[k] = { qty: 0, rev: 0 };
    byProd[k].qty += i.qty;
    byProd[k].rev += i.qty * (i.price || 0);
  });
  const topProducts = Object.entries(byProd)
    .map(([id, v]) => ({ name: pIdx[id]?.name || `#${id}`, ...v }))
    .sort((a, b) => b.rev - a.rev).slice(0, 10);

  view.innerHTML = `
    ${statsBar([
      { label: "Total revenue", value: fmtMoney(totalRev), color: "#4ade80" },
      { label: "Sales count", value: sales.length },
      { label: "Avg ticket", value: fmtMoney(avgTicket) },
      { label: "Units sold", value: totalUnits },
    ])}

    ${panel("Last 30 days revenue", days.length ? sparkline(days) : emptyState("No sales yet."))}

    ${panel("Top 10 products by revenue", topProducts.length ? `
      <table>
        <thead><tr><th>#</th><th>Product</th><th>Units</th><th>Revenue</th><th>Share</th></tr></thead>
        <tbody>${topProducts.map((p, i) => `
          <tr>
            <td>${i+1}</td>
            <td><b>${escapeHtml(p.name)}</b></td>
            <td>${p.qty}</td>
            <td style="color:#4ade80;">${fmtMoney(p.rev)}</td>
            <td style="font-size:11px;color:#94a3b8;">${totalRev?((p.rev/totalRev)*100).toFixed(1):0}%</td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No products sold yet."))}
  `;
}

function sparkline(days) {
  const max = Math.max(...days.map(d => d[1]), 1);
  return `
    <div style="display:flex;align-items:flex-end;gap:3px;height:120px;padding:10px 0;">
      ${days.map(([d, v]) => `
        <div title="${d}: ${fmtMoney(v)}" style="flex:1;background:linear-gradient(to top,#3b82f6,#60a5fa);height:${(v/max)*100}%;border-radius:3px 3px 0 0;min-height:2px;"></div>
      `).join("")}
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:4px;">
      <span>${days[0][0]}</span><span>${days[days.length-1][0]}</span>
    </div>
  `;
}

// ============ INVENTORY REPORTS ============
export async function renderInventoryReport(view) {
  const [products, stock, items] = await Promise.all([
    db.products.toArray(), db.stock_balance.toArray(), db.sale_items.toArray()
  ]);
  const sIdx = {}; stock.forEach(s => sIdx[s.productId] = s.qty);
  const sold = {}; items.forEach(i => sold[i.productId] = (sold[i.productId]||0) + i.qty);

  const totalSku = products.length;
  const totalUnits = products.reduce((s, p) => s + (sIdx[p.id]||0), 0);
  const inventoryValue = products.reduce((s, p) => s + (sIdx[p.id]||0) * (p.cost||0), 0);
  const low = products.filter(p => (sIdx[p.id]||0) < 5);
  const dead = products.filter(p => !sold[p.id] && (sIdx[p.id]||0) > 0);

  view.innerHTML = `
    ${statsBar([
      { label: "SKUs", value: totalSku },
      { label: "Units in stock", value: totalUnits },
      { label: "Inventory value (cost)", value: fmtMoney(inventoryValue), color: "#3b82f6" },
      { label: "Low stock items", value: low.length, color: low.length ? "#fbbf24" : "#4ade80" },
      { label: "Dead stock", value: dead.length, color: dead.length ? "#f87171" : "#4ade80" },
    ])}

    ${panel("All products — stock & turnover", products.length ? `
      <table>
        <thead><tr><th>Product</th><th>Cost</th><th>Price</th><th>Stock</th><th>Sold</th><th>Value</th><th>Status</th></tr></thead>
        <tbody>${products.map(p => {
          const q = sIdx[p.id] || 0;
          const sld = sold[p.id] || 0;
          const status = q === 0 ? { l:"Out", c:"#f87171" }
                       : q < 5  ? { l:"Low", c:"#fbbf24" }
                       : !sld   ? { l:"Stale", c:"#a78bfa" }
                       : { l:"OK", c:"#4ade80" };
          return `
            <tr>
              <td><b>${escapeHtml(p.name)}</b></td>
              <td>${fmtMoney(p.cost)}</td>
              <td>${fmtMoney(p.price)}</td>
              <td style="font-weight:600;color:${status.c};">${q}</td>
              <td>${sld}</td>
              <td>${fmtMoney(q * (p.cost||0))}</td>
              <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${status.c}22;color:${status.c};">${status.l}</span></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No products."))}

    ${low.length ? panel("⚠️ Reorder alert", `
      <table>
        <thead><tr><th>Product</th><th>Stock</th><th>Suggested order</th></tr></thead>
        <tbody>${low.map(p => `
          <tr><td>${escapeHtml(p.name)}</td><td style="color:#fbbf24;">${sIdx[p.id]||0}</td><td>+${Math.max(20, (sold[p.id]||0)*2)}</td></tr>
        `).join("")}</tbody>
      </table>
    `) : ""}
  `;
}

// ============ FINANCIAL REPORTS ============
export async function renderFinancialReport(view) {
  const [sales, items, products, payments, accounts, txs] = await Promise.all([
    db.sales.toArray(), db.sale_items.toArray(), db.products.toArray(),
    db.customer_payments.toArray(), db.bank_accounts.toArray(), db.bank_transactions.toArray()
  ]);
  const pIdx = Object.fromEntries(products.map(p => [p.id, p]));

  const revenue = sales.reduce((s,x) => s + (x.total||0), 0);
  const cogs = items.reduce((s,i) => s + (pIdx[i.productId]?.cost||0) * i.qty, 0);
  const grossProfit = revenue - cogs;
  const margin = revenue ? (grossProfit / revenue) * 100 : 0;

  const collected = payments.reduce((s,p) => s + Number(p.amount||0), 0);
  const cashIn = txs.filter(t => t.type==="in").reduce((s,t) => s + t.amount, 0);
  const cashOut = txs.filter(t => t.type==="out").reduce((s,t) => s + t.amount, 0);
  const cashOnHand = accounts.reduce((s,a) => s + (a.balance||0), 0);

  // Monthly revenue trend
  const byMonth = {};
  sales.forEach(s => {
    const m = new Date(s.createdAt).toISOString().slice(0,7);
    byMonth[m] = (byMonth[m] || 0) + (s.total||0);
  });
  const months = Object.entries(byMonth).sort((a,b) => a[0].localeCompare(b[0])).slice(-12);

  view.innerHTML = `
    ${statsBar([
      { label: "Revenue", value: fmtMoney(revenue), color: "#4ade80" },
      { label: "COGS", value: fmtMoney(cogs), color: "#f87171" },
      { label: "Gross profit", value: fmtMoney(grossProfit), color: grossProfit>=0?"#4ade80":"#f87171" },
      { label: "Margin", value: margin.toFixed(1) + "%" },
    ])}

    ${statsBar([
      { label: "Cash collected", value: fmtMoney(collected) },
      { label: "Cash in", value: fmtMoney(cashIn), color: "#4ade80" },
      { label: "Cash out", value: fmtMoney(cashOut), color: "#f87171" },
      { label: "Cash on hand", value: fmtMoney(cashOnHand), color: "#3b82f6" },
    ])}

    ${panel("Revenue trend (last 12 months)", months.length ? sparkline(months) : emptyState("No revenue history."))}

    ${panel("Profit & Loss (summary)", `
      <table>
        <tbody>
          <tr><td>Revenue</td><td style="text-align:right;color:#4ade80;">${fmtMoney(revenue)}</td></tr>
          <tr><td>Cost of goods sold</td><td style="text-align:right;color:#f87171;">−${fmtMoney(cogs)}</td></tr>
          <tr><td><b>Gross profit</b></td><td style="text-align:right;font-weight:700;color:${grossProfit>=0?"#4ade80":"#f87171"};">${fmtMoney(grossProfit)}</td></tr>
          <tr><td>Cash withdrawals (expenses)</td><td style="text-align:right;color:#f87171;">−${fmtMoney(cashOut)}</td></tr>
          <tr><td><b>Net profit (est.)</b></td><td style="text-align:right;font-weight:700;color:${(grossProfit-cashOut)>=0?"#4ade80":"#f87171"};font-size:18px;">${fmtMoney(grossProfit - cashOut)}</td></tr>
        </tbody>
      </table>
    `)}
  `;
}
