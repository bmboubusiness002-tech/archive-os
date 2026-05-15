export function safeQuery(root, selector) {
  if (!root || typeof root.querySelector !== "function") {
    return null;
  }

  return root.querySelector(selector);
}

export function safeSetHTML(root, selector, html) {
  const element = safeQuery(root, selector);

  if (!element) {
    console.warn("[safe-dom] missing element", selector);
    return false;
  }

  element.innerHTML = html;
  return true;
}

export function safeSetText(root, selector, text) {
  const element = safeQuery(root, selector);

  if (!element) {
    console.warn("[safe-dom] missing element", selector);
    return false;
  }

  element.textContent = text;
  return true;
}

export function isMounted(element) {
  return !!element && element.isConnected;
}
