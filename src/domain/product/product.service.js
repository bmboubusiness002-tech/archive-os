import { openDB, withTransaction } from "../../infra/db/db.js"
import { ProductRepo } from "./product.repo.js"
import { createProduct, updateProduct } from "./product.model.js"

// fallback UUID (browser-safe)
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "p-" + Math.random().toString(36).slice(2) + Date.now()
}

export class ProductService {
  constructor(repo = new ProductRepo()) {
    this.repo = repo
  }

  // ----------------------
  // Create Product
  // ----------------------
  async create(input) {
    const db = await openDB()

    const id = input.id || generateId()

    const product = createProduct({
      ...input,
      id
    })

    const exists = await this.repo.exists(db, product.id)
    if (exists) {
      throw new Error("Product already exists")
    }

    await withTransaction(db, ["products"], (tx) => {
      this.repo.put(tx, product)
    })

    return product
  }

  // ----------------------
  // Update Product
  // ----------------------
  async update(id, patch) {
    const db = await openDB()

    const existing = await this.repo.getById(db, id)
    if (!existing) {
      throw new Error("Product not found")
    }

    const updated = updateProduct(existing, patch)

    await withTransaction(db, ["products"], (tx) => {
      this.repo.put(tx, updated)
    })

    return updated
  }

  // ----------------------
  // Get Product
  // ----------------------
  async getById(id) {
    const db = await openDB()
    return this.repo.getById(db, id)
  }

  async getAll() {
    const db = await openDB()
    return this.repo.getAll(db)
  }
}
