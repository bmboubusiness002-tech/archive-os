export function calculateRepairProfit(repair) {
  const partsCost = (repair.parts || []).reduce((sum, p) => {
    return sum + (p.cost || 0) * (p.qty || 0)
  }, 0)

  const labor = repair.laborFee || 0
  const revenue = repair.price || 0

  const totalCost = partsCost + labor
  const profit = revenue - totalCost

  const margin = revenue > 0
    ? Math.round((profit / revenue) * 100)
    : 0

  return {
    revenue,
    partsCost,
    labor,
    totalCost,
    profit,
    margin
  }
}
