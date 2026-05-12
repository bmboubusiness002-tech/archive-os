export function createCustomer(data) {
  return {
    id: data.id || crypto.randomUUID(),
    name: data.name || "Unknown",
    phone: data.phone || "",
    createdAt: Date.now()
  };
}
