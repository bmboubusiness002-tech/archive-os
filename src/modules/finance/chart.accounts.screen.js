// -------------------------------------
// CHART OF ACCOUNTS UI
// -------------------------------------

import { AccountRepo } from "../../domain/account/account.repo.js";
import { createAccount } from "../../domain/account/account.model.js";

export async function renderChartAccounts(root) {
  const repo = new AccountRepo();
  const accounts = await repo.getAll();

  root.innerHTML = `
    <div class="accounts">

      <h2>📚 Chart of Accounts</h2>

      <div class="form">
        <input id="code" placeholder="Code" />
        <input id="name" placeholder="Name" />

        <select id="type">
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
          <option value="equity">Equity</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
        </select>

        <button id="add">Add</button>
      </div>

      <div class="list">
        ${accounts.map(a => `
          <div class="row">
            ${a.code} - ${a.name} (${a.type})
          </div>
        `).join("")}
      </div>

    </div>
  `;

  root.querySelector("#add").onclick = async () => {
    const account = createAccount({
      code: root.querySelector("#code").value,
      name: root.querySelector("#name").value,
      type: root.querySelector("#type").value
    });

    await repo.put(account);

    renderChartAccounts(root);
  };
}
