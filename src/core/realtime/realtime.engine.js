// -------------------------------------
// REAL-TIME ENGINE (SYSTEM SYNC)
// -------------------------------------

import { subscribe } from "./eventBus.js";
import { EVENTS } from "./events.js";

// Screens registry
const screens = new Set();

// -------------------------------------

export function registerScreen(renderFn) {
  screens.add(renderFn);

  return () => screens.delete(renderFn);
}

// -------------------------------------

export function initRealtimeEngine() {
  console.log("⚡ Real-time engine started");

  // 🔥 Core events that trigger refresh
  const refreshEvents = [
    EVENTS.SALE_CREATED,
    EVENTS.EXPENSE_CREATED,
    EVENTS.PAYMENT_CREATED,
    EVENTS.PURCHASE_CREATED,
    EVENTS.STOCK_UPDATED
  ];

  for (const ev of refreshEvents) {
    subscribe(ev, () => {
      refreshAll();
    });
  }
}

// -------------------------------------

function refreshAll() {
  console.log("🔄 REALTIME REFRESH");

  for (const render of screens) {
    try {
      render();
    } catch (e) {
      console.warn("Refresh error:", e);
    }
  }
}
