import { ProductService } from "../../domain/product/product.service.js";
import { createPurchase } from "../../app/usecases/createPurchase.js";
import { loadMasterDashboard } from "./master.dashboard.screen.js";

const service = new ProductService();

export async function loadPurchase() {
  const root = document.getElementById("view");

  const products = await service.getAll();

  root.innerHTML = `
    <div style="padding:20px;">
      <h2>📦 Purchase</h2>

      <select id="product">
        ${products.map(p => `<option value="${p.id}">${p.name}</option>`).join("")}
      </select>

      <input id="qty" type="number" placeholder="Qty"/>
      <input id="cost" type="number" placeholder="Cost"/>

      <button id="save">Save</button>
      <button id="back">Back</button>
    </div>
  `;

  document.getElementById("save").onclick = async () => {
    const productId = document.getElementById("product").value;
    const qty = Number(document.getElementById("qty").value);
    const cost = Number(document.getElementById("cost").value);

    await createPurchase({
      operationId: "purchase-" + Date.now(),
      items: [{ productId, qty, cost }],
      total: qty * cost
    });

    alert("Saved");
    loadMasterDashboard();
  };

  document.getElementById("back").onclick = loadMasterDashboard;
}
