// -------------------------------------
// PAYMENT MODAL V2 (PRO UX)
// -------------------------------------

export function openPaymentModalV2({ total, onConfirm }) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>💳 Payment</h3>

      <div>Total: <b>${total}</b></div>

      <input id="cash" placeholder="Cash" type="number"/>
      <input id="card" placeholder="Card" type="number"/>
      <input id="credit" placeholder="Credit" type="number"/>

      <div id="calc"></div>

      <button id="confirm">Confirm</button>
    </div>
  `;

  document.body.appendChild(modal);

  const calc = modal.querySelector("#calc");

  function compute() {
    const cash = Number(modal.querySelector("#cash").value || 0);
    const card = Number(modal.querySelector("#card").value || 0);
    const credit = Number(modal.querySelector("#credit").value || 0);

    const paid = cash + card + credit;

    calc.innerHTML = `
      Paid: ${paid}<br/>
      Change: ${Math.max(0, paid - total)}<br/>
      Remaining: ${Math.max(0, total - paid)}
    `;
  }

  modal.querySelectorAll("input").forEach(i => i.oninput = compute);

  modal.querySelector("#confirm").onclick = () => {
    const payments = [
      { method: "cash", amount: Number(modal.querySelector("#cash").value || 0) },
      { method: "card", amount: Number(modal.querySelector("#card").value || 0) },
      { method: "credit", amount: Number(modal.querySelector("#credit").value || 0) }
    ].filter(p => p.amount > 0);

    onConfirm(payments);
    modal.remove();
  };

  compute();
}
