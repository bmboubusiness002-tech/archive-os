// -------------------------------------
// Margin Analyzer (FINAL - SALE BASED)
// -------------------------------------

function safeNumber(n) {
  return Number(n) || 0;
}

export function analyzeMarginsFromSales(sales = []) {
  const map = new Map();

  for (const sale of sales) {
    if (!sale?.items) continue;

    for (const it of sale.items) {
      const id = it.productId;
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, {
          productId: id,
          name: id,
          revenue: 0,
          cost: 0,
          profit: 0,
          qty: 0,
          transactions: 0
        });
      }

      const p = map.get(id);

      const qty = safeNumber(it.qty);
      const price = safeNumber(it.price);
      const cost = safeNumber(it.cost);

      const revenue = price * qty;
      const totalCost = cost * qty;

      p.revenue += revenue;
      p.cost += totalCost;
      p.profit += revenue - totalCost;
      p.qty += qty;
      p.transactions += 1;
    }
  }

  return Array.from(map.values()).map(p => ({
    ...p,
    avgMargin:
      p.revenue > 0
        ? (p.profit / p.revenue) * 100
        : 0
  }));
}
