export function createRepairOrder(input) {
  const {
    device,
    issue,
    customerName,
    parts = [],
    laborFee = 0,
    price = 0
  } = input

  if (!device) throw new Error("device required")
  if (!issue) throw new Error("issue required")

  return {
    id: crypto.randomUUID(),
    device,
    issue,
    customerName: customerName || "Walk-in",

    parts, // [{ productId, qty, cost }]

    laborFee,
    price,

    status: "received",

    createdAt: Date.now()
  }
}
