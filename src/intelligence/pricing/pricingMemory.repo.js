// -------------------------------------
// Pricing Memory Repo (LOCAL STORAGE SAFE)
// -------------------------------------

const KEY = "pricing_memory_v1";

// -------------------------------------
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// -------------------------------------
export function loadPricingMemory() {
  return safeParse(localStorage.getItem(KEY)) || {};
}

// -------------------------------------
export function savePricingMemory(memory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch (e) {
    console.warn("⚠️ Pricing memory save failed", e);
  }
}

// -------------------------------------
// 🔥 MAIN UPDATE FUNCTION
export function updateProductMemory(productId, { success, price }) {
  if (!productId) return;

  const memory = loadPricingMemory();

  if (!memory[productId]) {
    memory[productId] = {
      attempts: 0,
      successes: 0,
      totalAcceptedPrice: 0,
      lastPrices: []
    };
  }

  const m = memory[productId];

  m.attempts++;

  if (success) {
    m.successes++;
    m.totalAcceptedPrice += Number(price) || 0;

    // keep last 10 prices
    m.lastPrices = (m.lastPrices || []).slice(-9);
    m.lastPrices.push(price);
  }

  savePricingMemory(memory);
}
