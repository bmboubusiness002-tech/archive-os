const telemetryState = {
  events: [],
  metrics: [],
  errors: [],
  navigation: [],
  actions: []
};

function now() {
  return performance?.now?.() || Date.now();
}

export function trackTelemetryEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    timestamp: new Date().toISOString(),
    runtime: now()
  };

  telemetryState.events.push(event);

  if (telemetryState.events.length > 500) {
    telemetryState.events.shift();
  }

  return event;
}

export function trackNavigation(pathname, metadata = {}) {
  const entry = {
    pathname,
    metadata,
    timestamp: new Date().toISOString()
  };

  telemetryState.navigation.push(entry);

  trackTelemetryEvent("navigation", entry);

  return entry;
}

export function trackRuntimeError(error, context = {}) {
  const entry = {
    message: error?.message || "unknown error",
    stack: error?.stack || null,
    context,
    timestamp: new Date().toISOString()
  };

  telemetryState.errors.push(entry);

  trackTelemetryEvent("runtime.error", entry);

  console.error("ERP Runtime Error", entry);

  return entry;
}

export async function measureAction(name, executor) {
  const startedAt = now();

  try {
    const result = await executor();

    const duration = now() - startedAt;

    const metric = {
      name,
      duration,
      success: true,
      timestamp: new Date().toISOString()
    };

    telemetryState.metrics.push(metric);
    telemetryState.actions.push(metric);

    trackTelemetryEvent("action.success", metric);

    return result;
  } catch (error) {
    const duration = now() - startedAt;

    const metric = {
      name,
      duration,
      success: false,
      timestamp: new Date().toISOString()
    };

    telemetryState.metrics.push(metric);

    trackRuntimeError(error, {
      action: name,
      duration
    });

    throw error;
  }
}

export function initializeRuntimeTelemetry() {
  window.__ERP_TELEMETRY__ = telemetryState;

  window.addEventListener("error", event => {
    trackRuntimeError(event.error || new Error(event.message), {
      source: "window.error"
    });
  });

  window.addEventListener("unhandledrejection", event => {
    trackRuntimeError(event.reason || new Error("unhandled rejection"), {
      source: "promise.rejection"
    });
  });

  const originalPushState = history.pushState;

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);

    trackNavigation(window.location.pathname, {
      type: "pushState"
    });

    return result;
  };

  window.addEventListener("popstate", () => {
    trackNavigation(window.location.pathname, {
      type: "popstate"
    });
  });

  trackTelemetryEvent("telemetry.initialized", {
    userAgent: navigator.userAgent
  });

  console.group("ERP Runtime Telemetry");
  console.info("Telemetry initialized");
  console.groupEnd();

  return telemetryState;
}
