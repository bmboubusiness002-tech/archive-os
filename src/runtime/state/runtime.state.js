const runtimeState = new Map();
const stateListeners = new Map();

export function setRuntimeState(key, value) {
  runtimeState.set(key, value);

  const listeners = stateListeners.get(key);
  if (!listeners) return value;

  for (const listener of listeners) {
    try {
      listener(value, snapshotRuntimeState());
    } catch (error) {
      console.warn("runtime state listener error", key, error);
    }
  }

  return value;
}

export function getRuntimeState(key, fallback = null) {
  return runtimeState.has(key) ? runtimeState.get(key) : fallback;
}

export function onRuntimeState(key, listener) {
  if (!stateListeners.has(key)) {
    stateListeners.set(key, new Set());
  }

  stateListeners.get(key).add(listener);

  return () => stateListeners.get(key)?.delete(listener);
}

export function snapshotRuntimeState() {
  return Object.fromEntries(runtimeState.entries());
}

export function updateWorkspaceState(partial = {}) {
  const current = getRuntimeState("workspace", {});
  return setRuntimeState("workspace", {
    ...current,
    ...partial,
    updatedAt: Date.now()
  });
}

export function getWorkspaceState() {
  return getRuntimeState("workspace", {});
}
