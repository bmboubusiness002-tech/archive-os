export function createRouteRegistry(routeDefinitions = {}) {
  const routes = new Map(Object.entries(routeDefinitions));

  function get(route) {
    return routes.get(route) || null;
  }

  function has(route) {
    return routes.has(route);
  }

  function entries() {
    return Array.from(routes.entries());
  }

  function list() {
    return entries().map(([route, definition]) => ({
      route,
      title: definition.title,
      capability: definition.capability || null,
      domain: definition.domain || null,
      implemented: typeof definition.load === "function"
    }));
  }

  return {
    get,
    has,
    entries,
    list
  };
}
