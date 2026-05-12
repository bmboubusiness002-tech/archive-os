import { ProductService } from "../../domain/product/product.service.js";
import { openDB, withTransaction } from "../../infra/db/db.js";

const service = new ProductService();

function getRoot() {
  return document.getElementById("view") || document.getElementById("app");
}

function renderList(products) {
  const list = document.getElementById("product-list");

  list.innerHTML = products.map(p => `
    <div class="card">
      <b>${p.name}</b>
      <div>${p.cost_price} → ${p.selling_price}</div>
      <button data-edit="${p.id}">Edit</button>
      <button data-del="${p.id}">Delete</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => deleteProduct(btn.dataset.del);
  });

  list.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => editProduct(btn.dataset.edit);
  });
}

async function loadProducts() {
  const products = await service.getAll();
  renderList(products);
}

async function addProduct() {
  const name = document.getElementById("name").value.trim();
  const cost = Number(document.getElementById("cost").value);
  const price = Number(document.getElementById("price").value);

  if (!name) return alert("Name required");

  await service.create({
    name,
    cost_price: cost,
    selling_price: price
  });

  await loadProducts();
}

async function deleteProduct(id) {
  const db = await openDB();

  await withTransaction(db, ["products"], async () => {
    await service.repo.delete(db, id); // ✅ FIX
  });

  await loadProducts();
}

async function editProduct(id) {
  const name = prompt("Name:");
  const cost = Number(prompt("Cost:"));
  const price = Number(prompt("Price:"));

  if (!name) return;

  await service.update(id, {
    name,
    cost_price: cost,
    selling_price: price
  });

  await loadProducts();
}

export async function loadProductsScreen() {
  const root = getRoot();

  root.innerHTML = `
    <div>
      <h2>Products</h2>

      <input id="name" placeholder="Name">
      <input id="cost" type="number" placeholder="Cost">
      <input id="price" type="number" placeholder="Price">
      <button id="add">Add</button>

      <div id="product-list"></div>
    </div>
  `;

  document.getElementById("add").onclick = addProduct;

  await loadProducts();
}
