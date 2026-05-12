export function computePricingSignals({ product, salesHistory, stock }) {
  const cost = stock?.avgCost ?? product?.cost ?? 0;

  const totalSold = salesHistory?.length ?? 0;

  const avgPrice =
    totalSold > 0
      ? salesHistory.reduce((sum, s) => sum + s.price, 0) / totalSold
      : product?.price ?? 0;

  const avgMargin =
    avgPrice > 0 ? (avgPrice - cost) / avgPrice : 0;

  return {
    cost,
    totalSold,
    avgPrice,
    avgMargin
  };
}
