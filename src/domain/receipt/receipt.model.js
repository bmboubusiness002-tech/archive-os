// -------------------------------------
// RECEIPT MODEL (FINAL FIX)
// -------------------------------------

export function buildReceipt({
  sale,
  items = [],
  customerName = "Walk-in Customer",
  customerId = null,
  paymentMethod = "cash"
}) {
  const total = Number(sale.total || 0);
  const cogs = Number(sale.cogs || 0);
  const profit = total - cogs;

  return {
    id: crypto.randomUUID(),

    saleId: sale.id,

    // 🔥 FIX CRITICAL
    customerName,
    customerId,

    items: items.map(i => ({
      productId: i.productId,
      name: i.name,
      qty: i.qty,
      price: i.price,
      total: i.qty * i.price
    })),

    total,
    cogs,
    profit,

    paymentMethod,

    createdAt: Date.now()
  };
}
