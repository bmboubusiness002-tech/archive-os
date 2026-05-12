import { createStockMovement } from "./stock.model.js"

export class StockService {
  constructor(stockRepo) {
    this.stockRepo = stockRepo
  }

  // ----------------------
  // Get Stock Balance
  // ----------------------
  async getStock(db, productId) {
    const movements = await this.stockRepo.findByProduct(db, productId)

    let stock = 0

    for (const m of movements) {
      if (m.type === "in") stock += m.quantity
      if (m.type === "out") stock -= m.quantity
    }

    return stock
  }

  // ----------------------
  // Validate Sale
  // ----------------------
  async validateSale(db, items) {
    for (const item of items) {
      const stock = await this.getStock(db, item.productId)

      if (stock < item.qty) {
        throw new Error(`Insufficient stock for product ${item.productId}`)
      }
    }
  }

  // ----------------------
  // Create Movements
  // ----------------------
  createSaleMovements(items, saleId) {
    const movements = []

    for (const item of items) {
      movements.push(
        createStockMovement({
          productId: item.productId,
          quantity: item.qty,
          type: "out",
          referenceId: saleId,
          referenceType: "sale"
        })
      )
    }

    return movements
  }
}
