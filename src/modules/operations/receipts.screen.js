import { openDB } from "../../infra/db/db.js";

export async function renderReceipts(root) {
  root.innerHTML = `<h2>🧾 Receipts</h2>`;

  const db = await openDB();

  const receipts = await new Promise(res => {
    const tx = db.transaction(["receipts"], "readonly");
    const store = tx.objectStore("receipts");

    const r = store.getAll();
    r.onsuccess = () => res(r.result || []);
  });

  if (!receipts.length) {
    root.innerHTML += `<p>No receipts yet</p>`;
    return;
  }

  receipts.reverse().forEach(r => {
    const card = document.createElement("div");

    card.style = `
      background:#111827;
      padding:16px;
      margin:12px 0;
      border-radius:12px;
      border:1px solid #1f2937;
      color:white;
    `;

    const itemsHTML = r.items.map(i => `
      <div style="display:flex;justify-content:space-between;">
        <span>${i.name || i.productId} × ${i.qty}</span>
        <span>${i.total || (i.price * i.qty)}</span>
      </div>
    `).join("");

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;">
        <b>🧾 Receipt</b>
        <span>${new Date(r.createdAt).toLocaleString()}</span>
      </div>

      <hr style="opacity:0.2;margin:10px 0"/>

      <div>👤 ${r.customer?.name || "Walk-in Customer"}</div>

      <div style="margin-top:10px;">
        ${itemsHTML}
      </div>

      <hr style="opacity:0.2;margin:10px 0"/>

      <div>💳 Payment: ${r.payment?.method || "cash"}</div>

      <div>💰 Total: ${r.total}</div>
      <div>📦 Cost: ${r.cogs}</div>
      <div>📈 Profit: ${r.profit}</div>

      <div style="margin-top:10px;">
        <button onclick="printReceipt('${r.id}')">
          🖨 Print
        </button>
      </div>
    `;

    root.appendChild(card);
  });
}

// 🔥 PRINT (PRO)
window.printReceipt = async function(id) {
  const db = await openDB();

  const r = await new Promise(res => {
    const tx = db.transaction(["receipts"], "readonly");
    const store = tx.objectStore("receipts");

    const req = store.get(id);
    req.onsuccess = () => res(req.result);
  });

  if (!r) return alert("Receipt not found");

  const html = `
    <div style="font-family:system-ui;padding:20px;">
      <h2>🧾 Receipt</h2>

      <p>${new Date(r.createdAt).toLocaleString()}</p>

      <hr/>

      <b>Customer:</b> ${r.customer?.name || "Walk-in"}<br/>
      <b>Payment:</b> ${r.payment?.method || "cash"}

      <hr/>

      ${r.items.map(i => `
        <div>${i.name || i.productId} × ${i.qty} = ${i.total || (i.price * i.qty)}</div>
      `).join("")}

      <hr/>

      <b>Total:</b> ${r.total}<br/>
      <b>Profit:</b> ${r.profit}
    </div>
  `;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.print();
};
