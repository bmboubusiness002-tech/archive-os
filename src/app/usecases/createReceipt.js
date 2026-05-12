// -------------------------------------
// CREATE RECEIPT (FINAL FIX)
// -------------------------------------

import { openDB, withTransaction } from "../../infra/db/db.js";
import { ReceiptRepo } from "../../domain/receipt/receipt.repo.js";
import { buildReceipt } from "../../domain/receipt/receipt.model.js";

export async function createReceipt({ sale, customer = null, payment = {} }) {
  const db = await openDB();
  const repo = new ReceiptRepo();

  const receipt = buildReceipt({
    sale,
    items: sale.items,

    // 🔥 FIX هنا
    customerName: customer?.name || "Walk-in Customer",
    customerId: customer?.id || null,

    paymentMethod: payment?.method || "cash"
  });

  await withTransaction(db, ["receipts"], (tx) => {
    repo.put(tx, receipt);
  });

  return receipt;
}
