// src/domain/sale/sale.repo.js

import { BaseRepo } from "../../infra/repos/base.repo.js";

export class SaleRepo extends BaseRepo {
  constructor() {
    super("sales");
  }

  async getAll(db) {
    const data = await super.getAll(db).catch(() => []);

    // 🔒 Defensive normalization
    return (data || []).map(s => ({
      ...s,
      items: Array.isArray(s.items) ? s.items : [],
      createdAt: s.createdAt || s.ts || s.date || Date.now()
    }));
  }
}
