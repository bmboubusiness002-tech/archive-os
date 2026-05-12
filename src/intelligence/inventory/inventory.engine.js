export function buildInventoryIntelligence({
  sales = [],
  stockMovements = [],
  stockBalance = []
}) {
  const balanceMap = new Map(
    stockBalance.map(b => [b.productId, b.quantity])
  );

  const map = new Map();

  for (const b of stockBalance) {
    map.set(b.productId, {
      productId: b.productId,
      sold: 0,
      revenue: 0,
      cost: 0
    });
  }

  for (const s of sales) {
    for (const it of s.items || []) {
      if (!map.has(it.productId)) {
        map.set(it.productId, {
          productId: it.productId,
          sold: 0,
          revenue: 0,
          cost: 0
        });
      }

      const node = map.get(it.productId);

      node.sold += it.qty;
      node.revenue += it.price * it.qty;
      node.cost += it.cost * it.qty;
    }
  }

  return [...map.values()].map(n => {
    const stock = balanceMap.get(n.productId) || 0;

    const profit = n.revenue - n.cost;

    return {
      ...n,
      stock: { available: stock },
      sales: { profit },
      intelligence: {
        risk: stock === 0 ? "OUT" : stock < 3 ? "LOW_STOCK" : "NORMAL",
        velocity: n.sold === 0 ? "DEAD" : n.sold > 10 ? "FAST" : "SLOW"
      }
    };
  });
}
