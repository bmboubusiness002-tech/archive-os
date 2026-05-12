export function createExpense(input) {
  if (!input) {
    throw new Error("Expense input required")
  }

  const amount = Number(input.amount)

  if (!amount || amount <= 0) {
    throw new Error("Invalid amount")
  }

  if (!input.category) {
    throw new Error("Category required")
  }

  return {
    id: "exp-" + Date.now(),
    amount,
    category: input.category,
    note: input.note || "",
    createdAt: new Date().toISOString()
  }
}
