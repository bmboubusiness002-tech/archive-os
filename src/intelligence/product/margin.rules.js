// -------------------------------------
// Margin Rules Engine (Decision Layer)
// -------------------------------------

/**
 * Classify product performance
 */
export function classifyMargin(product) {
  const { avgMargin, qty, profit } = product

  if (avgMargin < 0) {
    return {
      level: "danger",
      label: "LOSS",
      msg: "❌ Selling at loss"
    }
  }

  if (avgMargin < 10) {
    return {
      level: "warning",
      label: "LOW",
      msg: "⚠️ Very low margin"
    }
  }

  if (avgMargin < 25) {
    return {
      level: "average",
      label: "OK",
      msg: "🟡 متوسط"
    }
  }

  if (avgMargin >= 25 && qty >= 5) {
    return {
      level: "excellent",
      label: "TOP",
      msg: "🔥 High margin + volume"
    }
  }

  return {
    level: "good",
    label: "GOOD",
    msg: "✅ Healthy"
  }
}

/**
 * Detect risk patterns
 */
export function detectSignals(product) {
  const signals = []

  if (product.avgMargin < 5 && product.qty > 3) {
    signals.push({
      type: "bad_volume",
      msg: "⚠️ Selling a lot with very low margin"
    })
  }

  if (product.profit > 0 && product.qty === 1) {
    signals.push({
      type: "underutilized",
      msg: "💡 High margin but low sales"
    })
  }

  if (product.avgMargin < 0) {
    signals.push({
      type: "loss",
      msg: "❌ Losing money on this product"
    })
  }

  return signals
}
