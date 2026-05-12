const NAME_MIN = 2
const NAME_MAX = 120

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertInteger(n, field) {
  assert(Number.isInteger(n), `${field} must be integer`)
}

function assertNonNegative(n, field) {
  assert(n >= 0, `${field} must be >= 0`)
}

// ----------------------
// Factory (Create Product)
// ----------------------
export function createProduct(input) {
  const {
    id,
    name,
    cost_price,
    selling_price,
    createdAt
  } = input || {}

  assert(isNonEmptyString(id), "id required")
  assert(isNonEmptyString(name), "name required")

  const cleanName = name.trim()
  assert(cleanName.length >= NAME_MIN, "name too short")
  assert(cleanName.length <= NAME_MAX, "name too long")

  assertInteger(cost_price, "cost_price")
  assertInteger(selling_price, "selling_price")

  assertNonNegative(cost_price, "cost_price")
  assertNonNegative(selling_price, "selling_price")

  // Business rule
  assert(
    selling_price >= cost_price,
    "selling_price must be >= cost_price"
  )

  return {
    id,
    name: cleanName,
    cost_price,
    selling_price,
    createdAt: createdAt || Date.now()
  }
}

// ----------------------
// Update (Partial)
// ----------------------
export function updateProduct(existing, patch) {
  if (!existing) throw new Error("product not found")

  const next = {
    ...existing,
    ...patch
  }

  return createProduct(next)
}
