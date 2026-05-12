// Minimal inventory screen showing products + live stock balance.
import { ensureSeed, productsRepo, stockRepo } from "../pos/pos.db.js";
import { on } from "../pos/pos.events.js";

let unsubscribe = null;

export async function renderInventory(view) {
  if (!view) return;
  await ensureSeed();
  await draw(view);

  // Live update on every sale
  if (unsubscribe) unsubscribe();
  unsubscribe = on("sale:created", () => draw(view));
}

async function draw(view) {
  const [products, stock] = await Promise.all([
    productsRepo.list(),
    stockRepo.getAll()
  ]);

  const totalValue = products.reduce(
    (s, p) => s + (stock[p.id] || 0) * (p.cost || 0), 0
  );
  const totalUnits = products.reduce((s, p) => s + (stock[p.id] || 0), 0);
  const lowCount   = products.filter(p => (stock[p.id] || 0) < 5).length;

  view.innerHTML = `
    <div class="stats">
      <div>Products<b>${products.length}</b></div>
      <div>Units in stock<b>${totalUnits}</b></div>
      <div>Inventory value<b>${totalValue.toFixed(2)}</b></div>
      <div>Low stock<b style="color:${lowCount ? "#fbbf24" : "#4ade80"}">${lowCount}</b></div>
    </div>

    <table>
      <thead>
        <tr><th>Name</th><th>SKU</th><th>Price</th><th>Cost</th><th>Stock</th><th>Value</th></tr>
      </thead>
      <tbody>
        ${products.map(p => {
          const qty = stock[p.id] || 0;
          const value = (qty * (p.cost || 0)).toFixed(2);
          const low = qty < 5;
          return `
            <tr>
              <td>${escapeHtml(p.name)}</td>
              <td><code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;">${escapeHtml(p.sku || "")}</code></td>
              <td>${(p.price || 0).toFixed(2)}</td>
              <td>${(p.cost || 0).toFixed(2)}</td>
              <td style="color:${low ? "#fbbf24" : "#cbd5f5"};font-weight:600;">${qty}</td>
              <td>${value}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}
