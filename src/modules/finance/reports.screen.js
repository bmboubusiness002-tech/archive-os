// -------------------------------------
// REPORTS SCREEN (V2 PRO)
// FILTERS + PERIODS + GROUPING + DRILLDOWN
// -------------------------------------

import { openDB } from "../../infra/db/db.js";
import { LedgerRepo } from "../../domain/ledger/ledger.repo.js";
import {
  buildReport,
  drillGroup,
  drillOperation
} from "../../core/accounting/report.engine.js";

// -------------------------------------

export async function renderReports(root) {
  const db = await openDB();
  const repo = new LedgerRepo();

  const allEntries = await repo.getAll(db);

  let currentReport = null;

  root.innerHTML = `
    <div class="reports">

      <h2>📊 Accounting Reports PRO</h2>

      <!-- FILTERS -->
      <div class="filters">
        <label>From</label>
        <input type="date" id="from"/>

        <label>To</label>
        <input type="date" id="to"/>

        <label>Period</label>
        <select id="period">
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <label>Group By</label>
        <select id="group">
          <option value="none">None</option>
          <option value="type">Type</option>
          <option value="customer">Customer</option>
          <option value="product">Product</option>
        </select>

        <button id="apply">Apply</button>
      </div>

      <!-- GLOBAL -->
      <div id="global"></div>

      <!-- TIMELINE -->
      <div id="timeline"></div>

      <!-- GROUPS -->
      <div id="groups"></div>

      <!-- DRILL -->
      <div id="drill"></div>

    </div>
  `;

  const elGlobal = root.querySelector("#global");
  const elTimeline = root.querySelector("#timeline");
  const elGroups = root.querySelector("#groups");
  const elDrill = root.querySelector("#drill");

  // --------- RENDER ---------

  function render(report) {
    currentReport = report;

    // GLOBAL
    const g = report.global;
    elGlobal.innerHTML = `
      <div class="section">
        <h3>📊 Summary</h3>
        <div class="grid">
          <div>Revenue <b>${f(g.revenue)}</b></div>
          <div>COGS <b>${f(g.cogs)}</b></div>
          <div>Expenses <b>${f(g.expenses)}</b></div>
          <div>Net Profit <b>${f(g.netProfit)}</b></div>
          <div>Net Cash <b>${f(g.netCash)}</b></div>
        </div>
      </div>
    `;

    // TIMELINE
    elTimeline.innerHTML = `
      <div class="section">
        <h3>📈 Timeline (${report.filters.period})</h3>
        ${report.timeline.map(t => `
          <div class="row">
            <span>${t.label}</span>
            <span>Rev ${f(t.revenue)} | Net ${f(t.netProfit)} | Cash ${f(t.netCash)}</span>
          </div>
        `).join("")}
      </div>
    `;

    // GROUPS
    elGroups.innerHTML = `
      <div class="section">
        <h3>🧩 Groups (${report.filters.groupBy})</h3>

        ${report.groups.map(g => `
          <div class="row clickable" data-group="${g.key}">
            <span>${g.key}</span>
            <span>Net ${f(g.netProfit)} | Rev ${f(g.revenue)}</span>
          </div>
        `).join("")}
      </div>
    `;

    // bind group clicks
    elGroups.querySelectorAll("[data-group]").forEach(el => {
      el.onclick = () => renderGroup(el.dataset.group);
    });

    elDrill.innerHTML = "";
  }

  // --------- DRILL GROUP ---------

  function renderGroup(groupKey) {
    const ops = drillGroup(currentReport, groupKey);

    elDrill.innerHTML = `
      <div class="section">
        <h3>🔍 Operations (${groupKey})</h3>

        ${ops.map(o => `
          <div class="row clickable" data-op="${o.operationId}">
            <span>${new Date(o.createdAt).toLocaleString()}</span>
            <span>${o.operationId}</span>
          </div>
        `).join("")}
      </div>
    `;

    elDrill.querySelectorAll("[data-op]").forEach(el => {
      el.onclick = () => renderOperation(el.dataset.op);
    });
  }

  // --------- DRILL OPERATION ---------

  function renderOperation(opId) {
    const entries = drillOperation(currentReport, opId);

    elDrill.innerHTML = `
      <div class="section">
        <h3>📄 Ledger Entries (${opId})</h3>

        ${entries.map(e => `
          <div class="row">
            <span>${new Date(e.createdAt).toLocaleString()}</span>
            <span>${e.type}</span>
            <span>${e.debitAccount} → ${e.creditAccount}</span>
            <span>${f(e.amount)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  // --------- APPLY ---------

  root.querySelector("#apply").onclick = () => {
    const from = root.querySelector("#from").valueAsNumber || null;
    const to = root.querySelector("#to").valueAsNumber || null;
    const period = root.querySelector("#period").value;
    const groupBy = root.querySelector("#group").value;

    const report = buildReport(allEntries, {
      from,
      to,
      period,
      groupBy
    });

    render(report);
  };

  // INITIAL
  render(buildReport(allEntries));
}

// -------------------------------------

function f(n) {
  return new Intl.NumberFormat().format(n || 0);
}
