// -------------------------------------
// REAL-TIME EVENT BUS (LIGHTWEIGHT)
// -------------------------------------

const listeners = new Map();

// -------------------------------------
export function subscribe(event, handler) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }

  listeners.get(event).add(handler);

  return () => {
    listeners.get(event).delete(handler);
  };
}

// -------------------------------------
export function publish(event, payload) {
  if (!listeners.has(event)) return;

  for (const handler of listeners.get(event)) {
    try {
      handler(payload);
    } catch (e) {
      console.warn("Event error:", e);
    }
  }
}
