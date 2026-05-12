// -------------------------------------
// EVENT BUS (PUB / SUB)
// -------------------------------------

const listeners = {};

// -------------------------------------

export function subscribe(event, callback) {
  if (!listeners[event]) {
    listeners[event] = [];
  }

  listeners[event].push(callback);

  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
}

// -------------------------------------

export function publish(event, payload = {}) {
  const subs = listeners[event] || [];

  for (const cb of subs) {
    try {
      cb(payload);
    } catch (e) {
      console.error("Event error:", e);
    }
  }
}
