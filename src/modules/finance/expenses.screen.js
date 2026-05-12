// -------------------------------------
// EXPENSE SCREEN (FIXED + SHELL SAFE)
// -------------------------------------

import { createExpenseUseCase } from "../../app/usecases/createExpense.js";

function getRoot() {
  return document.getElementById("view") || document.getElementById("app");
}

function safeNumber(v) {
  return Number(v) || 0;
}

export async function loadExpense() {
  const root = getRoot();
  if (!root) return;

  root.innerHTML = `
    <div style="padding:20px;">
      <h2>💸 Add Expense</h2>

      <input id="amount" type="number" placeholder="Amount"/><br/><br/>
      <input id="category" placeholder="Category"/><br/><br/>
      <input id="note" placeholder="Note"/><br/><br/>

      <button id="save">Save</button>
    </div>
  `;

  document.getElementById("save").onclick = async () => {
    try {
      await createExpenseUseCase({
        amount: safeNumber(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        note: document.getElementById("note").value
      });

      alert("✅ Saved");

      // لا نخرج من النظام — نعيد تحميل نفس الشاشة
      loadExpense();

    } catch (e) {
      alert(e.message);
    }
  };
}
