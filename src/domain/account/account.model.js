// -------------------------------------
// ACCOUNT MODEL
// -------------------------------------

export function createAccount({
  id = crypto.randomUUID(),
  code,
  name,
  type, // asset | liability | equity | revenue | expense
  createdAt = Date.now()
}) {
  return {
    id,
    code,
    name,
    type,
    createdAt
  };
}
