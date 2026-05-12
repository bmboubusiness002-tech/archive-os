// -------------------------------------
// CART MODAL (POS V8)
// -------------------------------------

export function openCartModal({ products, onConfirm }) {
  const modal = document.createElement("div");
  modal.className = "modal";

  let cart = [];

  modal.innerHTML = `
    <div class="modal-content">
      <h3>🛒 Cart</h3>

      <div id="list"></div>

      <div id="summary"></div>

      <button id="checkout">Checkout</button>
      <button id="close">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  const list = modal.querySelector("#list");
  const summary = modal.querySelector("#summary");

  function render() {
    let total = 0;

    list.innerHTML = cart.map((i, idx) => {
      total += i.qty * i.price;

      return `
        <div>
          ${i.name}
          <input data-i="${idx}" class="qty" type="number" value="${i.qty}" />
          = ${i.qty * i.price}
        </div>
      `;
    }).join("");

    summary.innerHTML = `<b>Total: ${total}</b>`;

    list.querySelectorAll(".qty").forEach(inp => {
      inp.oninput = () => {
        const i = cart[inp.dataset.i];
        i.qty = Number(inp.value || 1);
        render();
      };
    });

    modal.querySelector("#checkout").onclick = () => {
      onConfirm({ cart, total });
      modal.remove();
    };
  }

  // add product externally
  modal.addItem = (p) => {
    const existing = cart.find(x => x.productId === p.id);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        productId: p.id,
        name: p.name,
        qty: 1,
        price: p.selling_price
      });
    }

    render();
  };

  modal.querySelector("#close").onclick = () => modal.remove();

  render();

  return modal;
}
