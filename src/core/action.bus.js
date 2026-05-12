// src/ui/core/action.bus.js

const listeners = {};

export function dispatch(action, payload) {
  console.log("⚡ Action:", action, payload);

  (listeners[action] || []).forEach(fn => fn(payload));
}

export function subscribe(action, handler) {
  if (!listeners[action]) listeners[action] = [];
  listeners[action].push(handler);
}
