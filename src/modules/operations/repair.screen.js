import { openDB, withTransaction } from "../../infra/db/db.js";
import { RepairRepo } from "../../domain/repair/repair.repo.js";
import { createRepair } from "../../app/usecases/createRepair.js";
import { calculateRepairProfit } from "../../domain/repair/repair.service.js";

function getRoot() {
  return document.getElementById("view") || document.getElementById("app");
}

function formatMoney(n) {
  return new Intl.NumberFormat().format(n || 0);
}

async function loadRepairs() {
  const db = await openDB();
  const repo = new RepairRepo();
  return repo.getAll(db);
}

function group(list) {
  return {
    received: list.filter(x => x.status === "received"),
    done: list.filter(x => x.status === "done")
  };
}

async function render() {
  const root = getRoot();

  const list = await loadRepairs();
  const g = group(list);

  root.innerHTML = `
    <div>
      <h2>Repairs</h2>

      ${g.received.map(r => {
        const p = calculateRepairProfit(r);
        return `<div>${r.device} → ${formatMoney(p.profit)}</div>`;
      }).join("")}
    </div>
  `;
}

export async function loadRepair() {
  await render();
}
