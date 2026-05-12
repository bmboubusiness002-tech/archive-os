// -------------------------------------
// PAYMENT MODAL (V7 PRO)
// -------------------------------------

export function openPaymentModal({ total, onConfirm }) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>💳 Payment</h3>

      <div>Total: <b id="total">${total}</b></div>

      <div class="payment-row">
        <label>Cash</label>
        <input id="cash" type="number" value="0" />
      </div>

      <div class="payment-row">
        <label>Card</label>
        <input id="card" type="number" value="0" />
      </div>

      <div class="payment-row">
        <label>Credit</label>
        <input id="credit" type="number" value="0" />
      </div>

      <hr/>

      <div id="summary"></div>

      <button id="confirm">Confirm</button>
      <button id="close">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  const cashEl = modal.querySelector("#cash");
  const cardEl = modal.querySelector("#card");
  const creditEl = modal.querySelector("#credit");
  const summary = modal.querySelector("#summary");

  function calc() {
    const cash = Number(cashEl.value || 0);
    const card = Number(cardEl.value || 0);
    const credit = Number(creditEl.value || 0);

    const paid = cash + card + credit;
    const change = paid - total;

    summary.innerHTML = `
      Paid: ${paid}<br/>
      Change: ${change > 0 ? change : 0}<br/>
      Remaining: ${paid < total ? total - paid : 0}
    `;
  }

  [cashEl, cardEl, creditEl].forEach(i => i.oninput = calc);
  calc();

  modal.querySelector("#confirm").onclick = () => {
    const payments = [
      { method: "cash", amount: Number(cashEl.value || 0) },
      { method: "card", amount: Number(cardEl.value || 0) },
      { method: "credit", amount: Number(creditEl.value || 0) }
    ].filter(p => p.amount > 0);

    onConfirm(payments);
    modal.remove();
  };

  modal.querySelector("#close").onclick = () => modal.remove();
}
