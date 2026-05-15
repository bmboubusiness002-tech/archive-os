// Self-contained POS screen: product grid + cart + checkout.

import { ensureSeed, productsRepo, stockRepo, salesRepo } from "./pos.db.js";
import { emit } from "./pos.events.js";

let cart = []; // [{ id, name, price, qty }]

export async function renderPOS(view) {
  if (!view) return;

  await ensureSeed();
  const [products, stock] = await Promise.all([
    productsRepo.list(),
    stockRepo.getAll()
  ]);

  view.innerHTML = `
    <div class="pos-wrap">
      <div class="pos-products">
        <div class="pos-toolbar">
          <input id="pos-search" placeholder="🔎 Search products…" />
          <span id="pos-count" class="muted">${products.length} items</span>
        </div>
        <div id="pos-grid" class="pos-grid"></div>
      </div>

      <aside class="pos-cart">
        <h3>🛒 Cart</h3>
        <div id="pos-lines" class="pos-lines"></div>

        <div class="pos-totals">
          <div><span>Items</span><b id="pos-items">0</b></div>
          <div><span>Total</span><b id="pos-total">0.00</b></div>
        </div>

        <button id="pos-checkout" class="pos-checkout" disabled>Checkout</button>
        <button id="pos-clear" class="pos-clear">Clear cart</button>

        <div id="pos-toast" class="pos-toast"></div>
      </aside>
    </div>
  `;

  const grid = view.querySelector("#pos-grid");
  renderGrid(grid, products, stock);

  const search = view.querySelector("#pos-search");
  const count = view.querySelector("#pos-count");

  if (search) {
    search.oninput = (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = !q ? products : products.filter(p =>
        p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q)
      );

      renderGrid(view.querySelector("#pos-grid"), filtered, stock);

      if (count) {
        count.textContent = `${filtered.length} items`;
      }
    };
  }

  const clearBtn = view.querySelector("#pos-clear");
  const checkoutBtn = view.querySelector("#pos-checkout");

  if (clearBtn) {
    clearBtn.onclick = () => {
      cart = [];
      renderCart(view);
    };
  }

  if (checkoutBtn) {
    checkoutBtn.onclick = () => doCheckout(view);
  }

  renderCart(view);
}

function isPOSMounted(view) {
  return !!view && !!view.querySelector(".pos-wrap");
}

function renderGrid(grid, products, stock) {
  if (!grid) return;

  grid.innerHTML = products.map(p => {
    const qty = stock[p.id] ?? 0;
    const out = qty <= 0;
    return `
      <button class="pcard ${out ? "out" : ""}" data-id="${p.id}" ${out ? "disabled" : ""}>
        <div class="pname">${escapeHtml(p.name)}</div>
        <div class="psku">${escapeHtml(p.sku || "")}</div>
        <div class="pfoot">
          <span class="pprice">${p.price.toFixed(2)}</span>
          <span class="pstock ${qty < 5 ? "low" : ""}">stk ${qty}</span>
        </div>
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".pcard").forEach(el => {
    el.onclick = () => {
      const id = Number(el.dataset.id);
      const p = products.find(x => x.id === id);

      if (!p) return;

      addToCart(p);

      const view = grid.closest(".view") || document.getElementById("view");
      renderCart(view);
    };
  });
}

function addToCart(p) {
  const line = cart.find(l => l.id === p.id);
  if (line) line.qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
}

function renderCart(view) {
  if (!isPOSMounted(view)) return;

  const linesEl = view.querySelector("#pos-lines");
  const itemsEl = view.querySelector("#pos-items");
  const totalEl = view.querySelector("#pos-total");
  const checkoutBtn = view.querySelector("#pos-checkout");

  if (!linesEl || !itemsEl || !totalEl || !checkoutBtn) return;

  if (!cart.length) {
    linesEl.innerHTML = `<div class="pos-empty">Cart is empty</div>`;
  } else {
    linesEl.innerHTML = cart.map(l => `
      <div class="pline" data-id="${l.id}">
        <div class="pline-name">${escapeHtml(l.name)}</div>
        <div class="pline-ctrl">
          <button class="qbtn" data-act="dec">−</button>
          <input class="qty" type="number" min="1" value="${l.qty}" />
          <button class="qbtn" data-act="inc">+</button>
          <span class="psub">${(l.price * l.qty).toFixed(2)}</span>
          <button class="qbtn rm" data-act="rm">×</button>
        </div>
      </div>
    `).join("");

    linesEl.querySelectorAll(".pline").forEach(row => {
      const id = Number(row.dataset.id);
      const line = cart.find(l => l.id === id);

      if (!line) return;

      row.querySelectorAll("[data-act]").forEach(b => {
        b.onclick = () => {
          const act = b.dataset.act;
          if (act === "inc") line.qty += 1;
          else if (act === "dec") line.qty = Math.max(1, line.qty - 1);
          else if (act === "rm") cart = cart.filter(l => l.id !== id);
          renderCart(view);
        };
      });

      const qty = row.querySelector(".qty");

      if (qty) {
        qty.onchange = (e) => {
          const v = Math.max(1, Number(e.target.value) || 1);
          line.qty = v;
          renderCart(view);
        };
      }
    });
  }

  const items = cart.reduce((s, l) => s + l.qty, 0);
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
  itemsEl.textContent = items;
  totalEl.textContent = total.toFixed(2);
  checkoutBtn.disabled = cart.length === 0;
}

async function doCheckout(view) {
  if (!cart.length || !isPOSMounted(view)) return;

  const btn = view.querySelector("#pos-checkout");

  if (btn) {
    btn.disabled = true;
  }

  try {
    const sale = await salesRepo.create(cart);
    emit("sale:created", sale);

    cart = [];

    if (!isPOSMounted(view)) return;

    showToast(view, `✅ Sale #${sale.id} saved · ${sale.total.toFixed(2)}`);

    const [products, stock] = await Promise.all([productsRepo.list(), stockRepo.getAll()]);

    if (!isPOSMounted(view)) return;

    renderGrid(view.querySelector("#pos-grid"), products, stock);
    renderCart(view);
  } catch (err) {
    console.error("checkout failed", err);

    if (isPOSMounted(view)) {
      showToast(view, `❌ ${err.message || "Checkout failed"}`, true);

      const checkoutBtn = view.querySelector("#pos-checkout");
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
      }
    }
  }
}

function showToast(view, msg, isError = false) {
  if (!isPOSMounted(view)) return;

  const toast = view.querySelector("#pos-toast");

  if (!toast) return;

  toast.textContent = msg;
  toast.className = "pos-toast show" + (isError ? " err" : "");

  setTimeout(() => {
    if (toast.isConnected) {
      toast.className = "pos-toast";
    }
  }, 2400);
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}
