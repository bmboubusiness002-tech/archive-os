const runtimeListeners = new Map();
const runtimeHistory = [];

function createEventId() {
  return `pos_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createRuntimeEvent(type, payload = {}) {
  return {
    id: createEventId(),
    type,
    domain: "pos",
    timestamp: Date.now(),
    payload
  };
}

export function emitPOSRuntimeEvent(type, payload = {}) {
  const event = createRuntimeEvent(type, payload);
  runtimeHistory.push(event);

  const listeners = runtimeListeners.get(type);
  if (!listeners) return event;

  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.warn("runtime listener error", type, error);
    }
  }

  return event;
}

export function onPOSRuntimeEvent(type, listener) {
  if (!runtimeListeners.has(type)) {
    runtimeListeners.set(type, new Set());
  }

  runtimeListeners.get(type).add(listener);

  return () => runtimeListeners.get(type)?.delete(listener);
}

export function getPOSRuntimeEvents() {
  return [...runtimeHistory];
}
