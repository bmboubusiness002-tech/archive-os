export function openReceiptModal(receipt) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const items = receipt.items.map(i => `
    <div>${i.name} × ${i.qty} = ${i.total}</div>
  `).join("");

  modal.innerHTML = `
    <div class="modal-box">
      <h2>🧾 Receipt</h2>

      <div>${new Date(receipt.createdAt).toLocaleString()}</div>

      ${items}

      <hr/>

      <div>Total: ${receipt.total}</div>
      <div>Profit: ${receipt.profit}</div>

      <button onclick="window.print()">Print</button>
      <button id="close">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#close").onclick = () => modal.remove();
}
