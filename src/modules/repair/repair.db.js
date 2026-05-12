// Repair domain helpers + seed for spare parts.
import { db } from "../pos/pos.db.js";

export const REPAIR_STATUSES = [
  "new", "diagnosing", "awaiting_parts", "repairing", "ready", "delivered", "cancelled"
];

export const STATUS_COLOR = {
  new:           "#60a5fa",
  diagnosing:    "#a78bfa",
  awaiting_parts:"#fbbf24",
  repairing:     "#22d3ee",
  ready:         "#4ade80",
  delivered:     "#94a3b8",
  cancelled:     "#f87171"
};

export const DEVICE_TYPES = ["phone", "laptop", "tv", "console", "other"];

const TECHNICIANS = ["Ahmad", "Sara", "Khaled", "Yara"];
export function getTechnicians() { return TECHNICIANS; }

export async function ensureRepairSeed() {
  const c = await db.spare_parts.count();
  if (c > 0) return;
  const seed = [
    { name: "iPhone 12 Screen",    sku: "SCR-IP12",  qty: 6, cost: 60, price: 120, deviceType: "phone" },
    { name: "Samsung S22 Battery", sku: "BAT-S22",   qty: 8, cost: 18, price: 40,  deviceType: "phone" },
    { name: "Phone Charging Port", sku: "PRT-USC",   qty: 15,cost: 4,  price: 15,  deviceType: "phone" },
    { name: "Laptop SSD 512GB",    sku: "SSD-512",   qty: 4, cost: 45, price: 90,  deviceType: "laptop" },
    { name: "Laptop Keyboard",     sku: "KEY-LP",    qty: 5, cost: 25, price: 60,  deviceType: "laptop" },
    { name: "TV Backlight Strip",  sku: "TV-BLT",    qty: 3, cost: 22, price: 55,  deviceType: "tv" },
    { name: "PS5 HDMI Port",       sku: "PS5-HDMI",  qty: 4, cost: 12, price: 35,  deviceType: "console" },
    { name: "Xbox Power Brick",    sku: "XB-PWR",    qty: 3, cost: 28, price: 65,  deviceType: "console" },
  ];
  await db.spare_parts.bulkAdd(seed);
}

export function newTicketCode() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const r = Math.floor(Math.random() * 9000) + 1000;
  return `RT-${y}${m}-${r}`;
}
