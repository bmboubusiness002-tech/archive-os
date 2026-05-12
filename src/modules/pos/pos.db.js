// Lightweight self-contained Dexie DB for POS + Inventory.
// Tables: products, sales, sale_items, stock_balance.
// Loaded via ESM CDN — no build step.

import Dexie from "https://esm.sh/dexie@4.0.8";

export const db = new Dexie("pos_core");

db.version(1).stores({
  products:      "++id, name, sku, price, cost",
  sales:         "++id, createdAt, total",
  sale_items:    "++id, saleId, productId",
  stock_balance: "productId, qty"
});

db.version(2).stores({
  sessions:          "++id, openedAt, closedAt, status",
  returns:           "++id, createdAt, saleId, total",
  quotations:        "++id, createdAt, customer, status, total",
  suppliers:         "++id, name, phone",
  purchase_orders:   "++id, createdAt, supplierId, status, total",
  customer_payments: "++id, createdAt, customer, amount, method"
});

db.version(3).stores({
  repair_tickets:      "++id, code, createdAt, customer, phone, deviceType, status, technician, deliveredAt",
  repair_diagnostics:  "++id, ticketId, createdAt",
  repair_part_uses:    "++id, ticketId, partId",
  spare_parts:         "++id, name, sku, qty, deviceType"
});

db.version(4).stores({
  warehouses:        "++id, name, location",
  stock_movements:   "++id, createdAt, productId, type",
  bom:               "++id, productId",
  production_orders: "++id, createdAt, productId, status",
  work_centers:      "++id, name, status",
  customers_v2:      "++id, name, phone, email",
  bank_accounts:     "++id, name, type",
  bank_transactions: "++id, createdAt, accountId, type",
  installments:      "++id, customer, dueDate, status",
  journal_entries:   "++id, createdAt, ref",
  accounts:          "++id, code, type",
  employees:         "++id, name, dept, role",
  timesheets:        "++id, employeeId, date",
  payroll_runs:      "++id, employeeId, period",
  hr_roles:          "++id, name",
  performance_reviews:"++id, employeeId, period",
  kpis:              "++id, name, period"
});

db.version(5).stores({
  branches:        "++id, name, status",
  print_templates: "++id, name, type",
  system_settings: "&key"
});

// Seed a few demo products on first run.
export async function ensureSeed() {
  const count = await db.products.count();
  if (count > 0) return;

  const seed = [
    { name: "Coffee Beans 1kg",  sku: "CB-1000", price: 35,  cost: 22 },
    { name: "Espresso Cup",      sku: "EC-001",  price: 8,   cost: 3  },
    { name: "Sugar 500g",        sku: "SG-500",  price: 6,   cost: 2  },
    { name: "Milk 1L",           sku: "MK-1L",   price: 9,   cost: 5  },
    { name: "Croissant",         sku: "CR-001",  price: 12,  cost: 4  },
    { name: "Bottled Water",     sku: "WT-500",  price: 4,   cost: 1  },
    { name: "Chocolate Bar",     sku: "CHB-100", price: 7,   cost: 3  },
    { name: "Phone Charger USB-C", sku: "CHG-USC", price: 45, cost: 18 },
  ];

  await db.transaction("rw", db.products, db.stock_balance, async () => {
    for (const p of seed) {
      const id = await db.products.add(p);
      await db.stock_balance.put({ productId: id, qty: 50 });
    }
  });
}

// --- Products ---
export const productsRepo = {
  list:    () => db.products.toArray(),
  get:     (id) => db.products.get(id),
};

// --- Stock ---
export const stockRepo = {
  async getQty(productId) {
    const r = await db.stock_balance.get(productId);
    return r ? r.qty : 0;
  },
  async getAll() {
    const all = await db.stock_balance.toArray();
    const map = {};
    for (const r of all) map[r.productId] = r.qty;
    return map;
  },
  async decrement(productId, qty) {
    const r = await db.stock_balance.get(productId);
    const current = r ? r.qty : 0;
    await db.stock_balance.put({ productId, qty: current - qty });
  }
};

// --- Sales ---
export const salesRepo = {
  async create(cart) {
    const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
    const createdAt = Date.now();

    return db.transaction("rw", db.sales, db.sale_items, db.stock_balance, async () => {
      const saleId = await db.sales.add({ createdAt, total });
      for (const line of cart) {
        await db.sale_items.add({
          saleId,
          productId: line.id,
          name: line.name,
          price: line.price,
          qty: line.qty,
          subtotal: line.price * line.qty
        });
        const sb = await db.stock_balance.get(line.id);
        const cur = sb ? sb.qty : 0;
        await db.stock_balance.put({ productId: line.id, qty: cur - line.qty });
      }
      return { id: saleId, createdAt, total, items: cart.length };
    });
  },

  list: () => db.sales.orderBy("createdAt").reverse().toArray(),
  itemsOf: (saleId) => db.sale_items.where("saleId").equals(saleId).toArray(),
};
