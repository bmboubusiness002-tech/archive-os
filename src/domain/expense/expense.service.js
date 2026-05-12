export function createExpense(input) {
  if (!input.amount || input.amount <= 0) {
    throw new Error("Invalid amount")
  }

  return {
    id: crypto.randomUUID(),
    date: Date.now(),
    category: input.category || "general",
    amount: input.amount,
    note: input.note || ""
  }
}
