export function createStockMovement({
  productId,
  quantity,
  type,
  referenceId,
  referenceType
}) {
  return {
    id: crypto.randomUUID(),
    productId,
    quantity,
    type, // "in" | "out"
    referenceId,
    referenceType,
    date: Date.now()
  }
}
