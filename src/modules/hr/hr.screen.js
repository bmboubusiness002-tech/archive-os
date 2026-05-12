// HR: Employees, Payroll, Timesheets, Roles, Performance, KPIs, Departments
import { db } from "../pos/pos.db.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

const DEPTS = ["hr", "sales", "it", "support", "operations", "finance"];

// ===== EMPLOYEES =====
export async function renderEmployees(view, deptFilter) {
  await drawEmp(view, deptFilter);
}
async function drawEmp(view, deptFilter) {
  let list = await db.employees.toArray();
  if (deptFilter) list = list.filter(e => e.dept === deptFilter);
  const totalSalary = list.reduce((s,e) => s + (e.salary||0), 0);

  view.innerHTML = `
    ${statsBar([
      { label: deptFilter ? `${deptFilter} staff` : "Employees", value: list.length },
      { label: "Total monthly salary", value: fmtMoney(totalSalary), color: "#3b82f6" },
      { label: "Departments", value: new Set(list.map(e=>e.dept)).size },
    ])}
    ${panel(deptFilter ? `${deptFilter.toUpperCase()} department` : "All employees", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Department</th><th>Salary</th><th>Joined</th><th></th></tr></thead>
        <tbody>${list.map(e => `
          <tr>
            <td>E-${String(e.id).padStart(3,"0")}</td>
            <td><b>${escapeHtml(e.name)}</b><br><small style="color:#64748b;">${escapeHtml(e.email||"")}</small></td>
            <td>${escapeHtml(e.role||"")}</td>
            <td><span style="background:#1e293b;padding:2px 8px;border-radius:10px;font-size:11px;">${escapeHtml(e.dept||"")}</span></td>
            <td>${fmtMoney(e.salary)}</td>
            <td style="font-size:12px;color:#94a3b8;">${e.joinedAt?fmtDate(e.joinedAt).split(",")[0]:"—"}</td>
            <td><button data-del="${e.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No employees."), `<button id="new-emp" style="background:#22c55e;">+ Add employee</button>`)}
  `;
  view.querySelector("#new-emp").onclick = () => openEmpModal(view, deptFilter);
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Delete employee?")) return;
    await db.employees.delete(Number(b.dataset.del));
    drawEmp(view, deptFilter);
  });
}

export async function renderAddEmployee(view) { await drawEmp(view); }

function openEmpModal(view, presetDept) {
  modal("Add employee", `
    <label>Full name<input name="name" required></label>
    <label>Email<input name="email" type="email"></label>
    <label>Role<input name="role" placeholder="Cashier / Manager / ..." required></label>
    <label>Department
      <select name="dept">${DEPTS.map(d => `<option ${d===presetDept?"selected":""}>${d}</option>`).join("")}</select>
    </label>
    <label>Monthly salary<input name="salary" type="number" step="0.01" value="0"></label>
  `, async (d) => {
    await db.employees.add({
      name: d.name, email: d.email, role: d.role, dept: d.dept,
      salary: Number(d.salary)||0, joinedAt: Date.now()
    });
    drawEmp(view, presetDept);
  });
}

// ===== PAYROLL =====
export async function renderPayroll(view) { await drawPayroll(view); }
async function drawPayroll(view) {
  const [emps, runs] = await Promise.all([db.employees.toArray(), db.payroll_runs.orderBy("period").reverse().toArray()]);
  const totalGross = runs.reduce((s,r) => s + r.gross, 0);
  const totalNet = runs.reduce((s,r) => s + r.net, 0);

  view.innerHTML = `
    ${statsBar([
      { label: "Payroll runs", value: runs.length },
      { label: "Gross paid", value: fmtMoney(totalGross) },
      { label: "Net paid", value: fmtMoney(totalNet), color: "#4ade80" },
      { label: "Active staff", value: emps.length },
    ])}
    ${panel("Generate payroll", `
      <label>Pay period<input id="pp-period" type="month" value="${new Date().toISOString().slice(0,7)}"></label>
      <label>Tax %<input id="pp-tax" type="number" value="10" min="0" max="100" style="width:80px;"></label>
      <button id="pp-run" style="background:#22c55e;margin-top:6px;">Run payroll</button>
    `)}
    ${panel("Payroll history", runs.length ? `
      <table>
        <thead><tr><th>Period</th><th>Employee</th><th>Gross</th><th>Tax</th><th>Net</th><th>Paid</th></tr></thead>
        <tbody>${runs.map(r => {
          const e = emps.find(x => x.id === r.employeeId);
          return `
            <tr>
              <td>${r.period}</td>
              <td>${escapeHtml(e?.name||"—")}</td>
              <td>${fmtMoney(r.gross)}</td>
              <td style="color:#f87171;">−${fmtMoney(r.deductions)}</td>
              <td style="color:#4ade80;font-weight:700;">${fmtMoney(r.net)}</td>
              <td>${r.paidAt?fmtDate(r.paidAt).split(",")[0]:"—"}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No payroll history yet."))}
  `;
  view.querySelector("#pp-run").onclick = async () => {
    const period = view.querySelector("#pp-period").value;
    const tax = Number(view.querySelector("#pp-tax").value)/100;
    if (!period) return;
    if (!confirm(`Run payroll for ${period}? This creates ${emps.length} entries.`)) return;
    for (const e of emps) {
      const gross = e.salary || 0;
      const deductions = gross * tax;
      const net = gross - deductions;
      await db.payroll_runs.add({
        employeeId: e.id, period, gross, deductions, net, paidAt: Date.now()
      });
    }
    drawPayroll(view);
  };
}

// ===== TIMESHEETS =====
export async function renderTimesheets(view) { await drawTS(view); }
async function drawTS(view) {
  const [emps, sheets] = await Promise.all([db.employees.toArray(), db.timesheets.orderBy("date").reverse().limit(100).toArray()]);
  const totalHrs = sheets.reduce((s,t) => s + (t.hours||0), 0);
  view.innerHTML = `
    ${statsBar([
      { label: "Entries", value: sheets.length },
      { label: "Total hours", value: totalHrs },
      { label: "Active employees", value: emps.length },
    ])}
    ${panel("Time entries", sheets.length ? `
      <table>
        <thead><tr><th>Date</th><th>Employee</th><th>Hours</th><th>Note</th></tr></thead>
        <tbody>${sheets.map(t => {
          const e = emps.find(x => x.id === t.employeeId);
          return `
            <tr>
              <td>${t.date}</td>
              <td>${escapeHtml(e?.name||"—")}</td>
              <td>${t.hours}</td>
              <td style="font-size:12px;color:#94a3b8;">${escapeHtml(t.note||"")}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No timesheet entries."), `<button id="new-ts" style="background:#22c55e;">+ Log time</button>`)}
  `;
  view.querySelector("#new-ts").onclick = () => modal("Log time", `
    <label>Employee
      <select name="employeeId">${emps.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("")}</select>
    </label>
    <label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
    <label>Hours<input name="hours" type="number" step="0.25" min="0" value="8"></label>
    <label>Note<input name="note"></label>
  `, async (d) => {
    await db.timesheets.add({
      employeeId: Number(d.employeeId), date: d.date,
      hours: Number(d.hours)||0, note: d.note
    });
    drawTS(view);
  });
}

// ===== ROLES =====
const PERMS = ["pos.use", "sales.view", "sales.edit", "inventory.manage", "purchase.manage", "finance.view", "hr.manage", "admin.full"];

export async function renderRoles(view) { await drawRoles(view); }
async function drawRoles(view) {
  const roles = await db.hr_roles.toArray();
  view.innerHTML = `
    ${statsBar([{ label: "Roles defined", value: roles.length }])}
    ${panel("All roles", roles.length ? `
      <table>
        <thead><tr><th>Name</th><th>Permissions</th><th></th></tr></thead>
        <tbody>${roles.map(r => `
          <tr>
            <td><b>${escapeHtml(r.name)}</b></td>
            <td style="font-size:12px;color:#94a3b8;">${(r.permissions||[]).join(", ") || "—"}</td>
            <td><button data-del="${r.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No roles defined."), `<button id="new-r" style="background:#22c55e;">+ Add role</button>`)}
  `;
  view.querySelector("#new-r").onclick = () => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
    wrap.innerHTML = `
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:440px;width:100%;color:#e2e8f0;">
        <h3 style="margin:0 0 14px;">Add role</h3>
        <label>Name<input id="rn" required></label>
        <h4 style="margin:14px 0 6px;font-size:12px;color:#94a3b8;">Permissions</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          ${PERMS.map(p => `<label style="font-size:12px;"><input type="checkbox" value="${p}" class="perm"> ${p}</label>`).join("")}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">
          <button data-c style="background:#334155;">Cancel</button>
          <button data-s style="background:#22c55e;">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.querySelector("[data-c]").onclick = () => wrap.remove();
    wrap.querySelector("[data-s]").onclick = async () => {
      const name = wrap.querySelector("#rn").value.trim();
      if (!name) return;
      const perms = [...wrap.querySelectorAll(".perm:checked")].map(c => c.value);
      await db.hr_roles.add({ name, permissions: perms });
      wrap.remove();
      drawRoles(view);
    };
  };
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    await db.hr_roles.delete(Number(b.dataset.del));
    drawRoles(view);
  });
}

export async function renderRoleDetails(view) {
  const roles = await db.hr_roles.toArray();
  const emps = await db.employees.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "Roles", value: roles.length },
      { label: "Permissions defined", value: PERMS.length },
    ])}
    ${panel("Role × Permission matrix", roles.length ? `
      <table>
        <thead><tr><th>Role</th>${PERMS.map(p => `<th style="font-size:10px;">${p}</th>`).join("")}<th>Holders</th></tr></thead>
        <tbody>${roles.map(r => {
          const holders = emps.filter(e => (e.role||"").toLowerCase() === r.name.toLowerCase()).length;
          return `
            <tr>
              <td><b>${escapeHtml(r.name)}</b></td>
              ${PERMS.map(p => `<td style="text-align:center;">${(r.permissions||[]).includes(p) ? `<span style="color:#4ade80;">✓</span>` : `<span style="color:#475569;">—</span>`}</td>`).join("")}
              <td>${holders}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("Define roles first."))}
  `;
}

// ===== PERFORMANCE REVIEWS =====
export async function renderPerformance(view) { await drawPerf(view); }
async function drawPerf(view) {
  const [emps, reviews] = await Promise.all([db.employees.toArray(), db.performance_reviews.orderBy("period").reverse().toArray()]);
  const avgScore = reviews.length ? (reviews.reduce((s,r) => s + r.score, 0) / reviews.length) : 0;
  view.innerHTML = `
    ${statsBar([
      { label: "Reviews", value: reviews.length },
      { label: "Avg score", value: avgScore.toFixed(1) + "/10", color: avgScore >= 7 ? "#4ade80" : "#fbbf24" },
      { label: "Employees evaluated", value: new Set(reviews.map(r=>r.employeeId)).size },
    ])}
    ${panel("Review history", reviews.length ? `
      <table>
        <thead><tr><th>Period</th><th>Employee</th><th>Score</th><th>Notes</th></tr></thead>
        <tbody>${reviews.map(r => {
          const e = emps.find(x => x.id === r.employeeId);
          const color = r.score >= 8 ? "#4ade80" : r.score >= 5 ? "#fbbf24" : "#f87171";
          return `
            <tr>
              <td>${escapeHtml(r.period)}</td>
              <td>${escapeHtml(e?.name||"—")}</td>
              <td style="color:${color};font-weight:700;">${r.score}/10</td>
              <td style="font-size:12px;color:#94a3b8;">${escapeHtml(r.notes||"")}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No reviews yet."), `<button id="new-rv" style="background:#22c55e;">+ Add review</button>`)}
  `;
  view.querySelector("#new-rv").onclick = () => modal("New performance review", `
    <label>Employee
      <select name="employeeId">${emps.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("")}</select>
    </label>
    <label>Period (e.g. Q1 2026)<input name="period" required></label>
    <label>Score (1-10)<input name="score" type="number" min="1" max="10" value="7"></label>
    <label>Notes<textarea name="notes" rows="3"></textarea></label>
  `, async (d) => {
    await db.performance_reviews.add({
      employeeId: Number(d.employeeId), period: d.period,
      score: Number(d.score)||0, notes: d.notes,
      createdAt: Date.now()
    });
    drawPerf(view);
  });
}

// ===== KPIs =====
export async function renderKPIs(view) { await drawKPI(view); }
async function drawKPI(view) {
  const list = await db.kpis.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "KPIs tracked", value: list.length },
      { label: "On target", value: list.filter(k => k.actual >= k.target).length, color: "#4ade80" },
      { label: "Behind", value: list.filter(k => k.actual < k.target).length, color: "#fbbf24" },
    ])}
    ${panel("KPI dashboard", list.length ? `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
        ${list.map(k => {
          const pct = k.target ? Math.min(100, (k.actual / k.target) * 100) : 0;
          const color = pct >= 100 ? "#4ade80" : pct >= 70 ? "#fbbf24" : "#f87171";
          return `
            <div style="background:#1e293b;border-radius:10px;padding:14px;">
              <div style="font-size:12px;color:#94a3b8;">${escapeHtml(k.name)}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${escapeHtml(k.period||"")}</div>
              <div style="font-size:20px;font-weight:700;color:${color};">${k.actual} <span style="color:#64748b;font-size:13px;">/ ${k.target}</span></div>
              <div style="background:#0b1220;height:6px;border-radius:3px;margin-top:8px;overflow:hidden;">
                <div style="background:${color};height:100%;width:${pct}%;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;">
                <span style="color:${color};">${pct.toFixed(0)}%</span>
                <button data-del="${k.id}" style="background:transparent;color:#f87171;font-size:11px;padding:0;">×</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    ` : emptyState("No KPIs yet."), `<button id="new-k" style="background:#22c55e;">+ Add KPI</button>`)}
  `;
  view.querySelector("#new-k").onclick = () => modal("Add KPI", `
    <label>Name<input name="name" required></label>
    <label>Period (e.g. Q1 2026)<input name="period"></label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;">Target<input name="target" type="number" step="0.01" required></label>
      <label style="flex:1;">Actual<input name="actual" type="number" step="0.01" value="0"></label>
    </div>
  `, async (d) => {
    await db.kpis.add({
      name: d.name, period: d.period,
      target: Number(d.target)||0, actual: Number(d.actual)||0
    });
    drawKPI(view);
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    await db.kpis.delete(Number(b.dataset.del));
    drawKPI(view);
  });
}

// ===== DEPARTMENT (factory for dept routes) =====
export function renderDepartment(deptName) {
  return async (view) => { await drawEmp(view, deptName); };
}
