// Admin: Users, Roles, Branches, Print Templates, System info, Privacy, Terms.
import { db } from "../pos/pos.db.js";
import { fmtDate, statsBar, panel, emptyState, modal, escapeHtml } from "../_shared/ui.js";

// ===== USERS (employees with login) =====
export async function renderUsers(view) {
  const emps = await db.employees.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "System users", value: emps.length },
      { label: "Active", value: emps.length, color: "#4ade80" },
    ])}
    ${panel("Users (linked to employees)", emps.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Username</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
        <tbody>${emps.map(e => `
          <tr>
            <td>U-${String(e.id).padStart(3,"0")}</td>
            <td><b>${escapeHtml(e.name)}</b><br><small style="color:#64748b;">${escapeHtml(e.email||"")}</small></td>
            <td><code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;">${escapeHtml((e.email||e.name).split("@")[0].toLowerCase())}</code></td>
            <td>${escapeHtml(e.role||"—")}</td>
            <td><span style="background:#1e293b;padding:2px 8px;border-radius:10px;font-size:11px;">${escapeHtml(e.dept||"")}</span></td>
            <td><span style="color:#4ade80;">● Active</span></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("Add employees in HR to create system users."))}
  `;
}

// ===== ROLES (admin view, links to HR roles) =====
export async function renderAdminRoles(view) {
  const roles = await db.hr_roles.toArray();
  const emps = await db.employees.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "Roles", value: roles.length },
      { label: "Users assigned", value: emps.filter(e => roles.some(r => r.name.toLowerCase() === (e.role||"").toLowerCase())).length },
    ])}
    ${panel("System roles", roles.length ? `
      <table>
        <thead><tr><th>Role</th><th>Permissions</th><th>Users</th></tr></thead>
        <tbody>${roles.map(r => `
          <tr>
            <td><b>${escapeHtml(r.name)}</b></td>
            <td style="font-size:12px;color:#94a3b8;">${(r.permissions||[]).map(p => `<span style="background:#1e293b;padding:1px 6px;border-radius:8px;margin:2px;display:inline-block;">${p}</span>`).join("") || "—"}</td>
            <td>${emps.filter(e => (e.role||"").toLowerCase() === r.name.toLowerCase()).length}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("Define roles under HR → Roles."))}
  `;
}

// ===== BRANCHES =====
export async function renderBranches(view) { await drawBranches(view); }
async function drawBranches(view) {
  const list = await db.branches.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "Branches", value: list.length },
      { label: "Active", value: list.filter(b => b.status==="active").length, color: "#4ade80" },
    ])}
    ${panel("All branches", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Address</th><th>Manager</th><th>Phone</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map(b => `
          <tr>
            <td>BR-${String(b.id).padStart(3,"0")}</td>
            <td><b>${escapeHtml(b.name)}</b></td>
            <td style="font-size:12px;color:#94a3b8;">${escapeHtml(b.address||"")}</td>
            <td>${escapeHtml(b.manager||"—")}</td>
            <td>${escapeHtml(b.phone||"—")}</td>
            <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;color:${b.status==="active"?"#4ade80":"#f87171"};background:${b.status==="active"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)"};">${b.status}</span></td>
            <td><button data-del="${b.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No branches yet."), `<button id="new-br" style="background:#22c55e;">+ Add branch</button>`)}
  `;
  view.querySelector("#new-br").onclick = () => modal("Add branch", `
    <label>Name<input name="name" required></label>
    <label>Address<input name="address"></label>
    <label>Manager<input name="manager"></label>
    <label>Phone<input name="phone"></label>
    <label>Status
      <select name="status"><option>active</option><option>inactive</option></select>
    </label>
  `, async (d) => {
    await db.branches.add({ name:d.name, address:d.address, manager:d.manager, phone:d.phone, status:d.status });
    drawBranches(view);
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Delete branch?")) return;
    await db.branches.delete(Number(b.dataset.del));
    drawBranches(view);
  });
}

// ===== PRINT TEMPLATES =====
const TEMPLATE_TYPES = ["invoice", "receipt", "quotation", "repair_invoice", "purchase_order"];

export async function renderTemplates(view) { await drawT(view); }
async function drawT(view) {
  const list = await db.print_templates.toArray();
  view.innerHTML = `
    ${statsBar([
      { label: "Templates", value: list.length },
      { label: "Types covered", value: new Set(list.map(t => t.type)).size, color: "#3b82f6" },
    ])}
    ${panel("Print templates", list.length ? `
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Type</th><th>Header</th><th>Footer</th><th></th></tr></thead>
        <tbody>${list.map(t => `
          <tr>
            <td>T-${String(t.id).padStart(3,"0")}</td>
            <td><b>${escapeHtml(t.name)}</b></td>
            <td><span style="background:#1e293b;padding:2px 8px;border-radius:10px;font-size:11px;">${t.type}</span></td>
            <td style="font-size:12px;color:#94a3b8;max-width:160px;">${escapeHtml((t.header||"").slice(0,60))}</td>
            <td style="font-size:12px;color:#94a3b8;max-width:160px;">${escapeHtml((t.footer||"").slice(0,60))}</td>
            <td>
              <button data-prev="${t.id}" style="background:#3b82f6;padding:3px 8px;font-size:11px;">Preview</button>
              <button data-del="${t.id}" style="background:#ef4444;padding:3px 8px;font-size:11px;">Del</button>
            </td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No templates yet."), `<button id="new-t" style="background:#22c55e;">+ Add template</button>`)}
  `;
  view.querySelector("#new-t").onclick = () => modal("Add print template", `
    <label>Name<input name="name" required></label>
    <label>Type
      <select name="type">${TEMPLATE_TYPES.map(t => `<option>${t}</option>`).join("")}</select>
    </label>
    <label>Header text<textarea name="header" rows="3" placeholder="Company name, address, tax #"></textarea></label>
    <label>Footer text<textarea name="footer" rows="2" placeholder="Thank you for your business!"></textarea></label>
  `, async (d) => {
    await db.print_templates.add({ name:d.name, type:d.type, header:d.header, footer:d.footer });
    drawT(view);
  });
  view.querySelectorAll("[data-prev]").forEach(b => b.onclick = async () => {
    const t = await db.print_templates.get(Number(b.dataset.prev));
    const w = window.open("", "_blank", "width=600,height=600");
    w.document.write(`
      <html><head><title>${escapeHtml(t.name)}</title>
      <style>body{font-family:system-ui,sans-serif;padding:30px;color:#222;}.h{border-bottom:2px solid #222;padding-bottom:10px;white-space:pre-wrap;}.b{padding:30px 0;color:#888;text-align:center;}.f{border-top:1px dashed #999;padding-top:10px;text-align:center;color:#444;white-space:pre-wrap;}</style>
      </head><body>
        <div class="h">${escapeHtml(t.header || "")}</div>
        <div class="b">— sample ${escapeHtml(t.type)} content —</div>
        <div class="f">${escapeHtml(t.footer || "")}</div>
      </body></html>
    `);
    w.document.close();
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    await db.print_templates.delete(Number(b.dataset.del));
    drawT(view);
  });
}

// ===== SYSTEM INFO =====
export async function renderSystem(view) {
  const counts = {};
  for (const t of db.tables) counts[t.name] = await t.count();
  const totalRecords = Object.values(counts).reduce((s,n) => s+n, 0);

  view.innerHTML = `
    ${statsBar([
      { label: "DB version", value: "v" + db.verno },
      { label: "Tables", value: db.tables.length },
      { label: "Total records", value: totalRecords, color: "#3b82f6" },
      { label: "Engine", value: "Dexie 4.0.8" },
    ])}

    ${panel("System information", `
      <table>
        <tbody>
          <tr><td>Database name</td><td><code>${db.name}</code></td></tr>
          <tr><td>Engine</td><td>IndexedDB via Dexie ${db.verno}</td></tr>
          <tr><td>Storage</td><td>Local-first (browser only)</td></tr>
          <tr><td>App version</td><td>POS · ERP v2026</td></tr>
          <tr><td>Modules loaded</td><td>POS, Inventory, Sales, Purchases, Repair, Manufacturing, CRM, Finance, HR, Intelligence, Admin</td></tr>
        </tbody>
      </table>
    `)}

    ${panel("Storage usage by table", `
      <table>
        <thead><tr><th>Table</th><th>Records</th></tr></thead>
        <tbody>${Object.entries(counts).sort((a,b) => b[1]-a[1]).map(([n,c]) => `
          <tr><td><code style="font-size:11px;">${n}</code></td><td>${c}</td></tr>
        `).join("")}</tbody>
      </table>
    `)}

    ${panel("⚠ Danger zone", `
      <button id="wipe" style="background:#ef4444;">Wipe all local data</button>
      <p style="font-size:12px;color:#64748b;margin-top:8px;">This deletes the local IndexedDB and reloads the app. Cannot be undone.</p>
    `)}
  `;
  view.querySelector("#wipe").onclick = async () => {
    if (!confirm("Wipe ALL local data? This cannot be undone.")) return;
    await db.delete();
    location.reload();
  };
}

// ===== PRIVACY / TERMS =====
const DEFAULT_PRIVACY = `Privacy Policy

This POS · ERP application stores all your business data locally in your browser using IndexedDB. No data leaves your device unless you explicitly export it.

1. Data Collection
We do not collect, transmit, or share any of your business data with third parties.

2. Data Storage
All sales, inventory, customers, employees, and financial records are stored in your browser's local database (pos_core).

3. Data Security
You are responsible for backing up your data. Clearing browser storage will permanently delete all records.

4. Cookies
The application does not use tracking cookies.

5. Contact
For questions about this policy, contact your system administrator.`;

const DEFAULT_TERMS = `Terms & Conditions

By using this POS · ERP application you agree to the following terms.

1. Use of the System
The application is provided as-is for managing point-of-sale, inventory, and business operations.

2. Data Responsibility
You are solely responsible for the accuracy of data entered and for maintaining backups.

3. Liability
The application is provided without warranty. The vendor is not liable for data loss, business interruption, or financial loss arising from use of the system.

4. Modifications
These terms may be updated by the system administrator at any time.

5. Acceptance
Continued use of the application constitutes acceptance of these terms.`;

export async function renderPrivacy(view) { await renderPolicy(view, "privacy", "Privacy Policy", DEFAULT_PRIVACY); }
export async function renderTerms(view)   { await renderPolicy(view, "terms",   "Terms & Conditions", DEFAULT_TERMS); }

async function renderPolicy(view, key, title, fallback) {
  const rec = await db.system_settings.get(key);
  const text = rec?.value ?? fallback;
  view.innerHTML = `
    ${panel(title, `
      <textarea id="pol" rows="20" style="width:100%;font-family:ui-monospace,monospace;font-size:13px;line-height:1.5;background:#0b1220;color:#e2e8f0;border:1px solid #1e293b;border-radius:8px;padding:14px;">${escapeHtml(text)}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button id="save" style="background:#22c55e;">Save</button>
        <button id="reset" style="background:#334155;">Reset to default</button>
        <button id="print" style="background:#3b82f6;margin-left:auto;">Print / Export</button>
      </div>
      <div id="msg"></div>
    `)}
  `;
  view.querySelector("#save").onclick = async () => {
    await db.system_settings.put({ key, value: view.querySelector("#pol").value });
    view.querySelector("#msg").innerHTML = `<div style="margin-top:10px;padding:8px;background:rgba(34,197,94,0.15);color:#4ade80;border-radius:6px;text-align:center;">✅ Saved</div>`;
    setTimeout(() => view.querySelector("#msg").innerHTML = "", 2000);
  };
  view.querySelector("#reset").onclick = async () => {
    if (!confirm("Reset to default text?")) return;
    await db.system_settings.delete(key);
    renderPolicy(view, key, title, fallback);
  };
  view.querySelector("#print").onclick = () => {
    const w = window.open("", "_blank", "width=620,height=720");
    w.document.write(`<html><head><title>${title}</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#222;line-height:1.6;white-space:pre-wrap;}h1{border-bottom:2px solid #222;padding-bottom:10px;}</style></head><body><h1>${title}</h1>${escapeHtml(view.querySelector("#pol").value)}</body></html>`);
    w.document.close();
  };
}
