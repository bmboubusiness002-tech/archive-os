// -------------------------------------
// Smart Control Engine
// -------------------------------------

export class ControlError extends Error {
  constructor(message) {
    super(message)
    this.name = "ControlError"
  }
}

// -------------------------------------
// Stock Check
// -------------------------------------
export function assertStockAvailable(stockBalance, productId, qty) {
  const current = stockBalance[productId] || 0

  if (current < qty) {
    throw new ControlError(
      `❌ Not enough stock for product ${productId} (available: ${current})`
    )
  }
}

// -------------------------------------
// Profit Protection
// -------------------------------------
export function assertNotSellingAtLoss(cost, price) {
  if (price < cost) {
    throw new ControlError(
      `❌ Selling at loss is not allowed (cost: ${cost}, price: ${price})`
    )
  }
}

// -------------------------------------
// Cash Protection
// -------------------------------------
export function assertCashSafe(cashAfter) {
  if (cashAfter < -50000) {
    throw new ControlError(
      `🚨 Cash too low! Risk zone reached (${cashAfter})`
    )
  }
}
