// -------------------------------------
// STOCK BALANCE REPO (PRO LEVEL)
// -------------------------------------

import { BaseRepo } from "../../infra/repos/base.repo.js";

export class StockBalanceRepo extends BaseRepo {
  constructor() {
    super("stock_balance");
  }

  async get(db, productId) {
    const item = await this.getById(db, productId);

    if (!item) {
      return {
        id: productId,
        productId,
        quantity: 0
      };
    }

    return {
      id: productId,
      productId,
      quantity: Number(item.quantity || 0)
    };
  }

  async getAllMap(db) {
    const all = await this.getAll(db);

    const map = {};

    for (const item of all) {
      map[item.productId] = Number(item.quantity || 0);
    }

    return map;
  }
}
