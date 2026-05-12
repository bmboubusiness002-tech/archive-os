// Comprehensive ERP / POS / RepairFlow / HR / CRM sidebar (2026 layout)
import { renderLayout } from "./layout.engine.js";

const expanded = new Set(["intelligence", "operations"]);
let activeRoute = "/";

function buildMenu() {
  return [
    section("intelligence", "🧠 Intelligence", [
      item("/", "Overview", "📊"),
      item("/intelligence/predictive", "Predictive Analytics", "🔮"),
      item("/intelligence/strategy", "Strategy Advisor", "🧭"),
      item("/intelligence/scenarios", "Scenario Simulation", "🧪"),
    ]),

    section("operations", "🛒 Operations", [
      group("POS", [
        item("/pos", "Start Sale", "🧾"),
        item("/pos/sessions", "Sessions", "🕒"),
        item("/pos/returns", "Returns", "↩️"),
      ]),
      group("Sales", [
        item("/sales", "Sales History", "📈"),
        item("/sales/invoices", "Invoices", "🧾"),
        item("/sales/quotations", "Quotations", "📝"),
        item("/sales/payments", "Customer Payments", "💵"),
      ]),
      group("Purchases", [
        item("/purchase", "Purchase Orders", "🛍️"),
        item("/purchase/suppliers", "Suppliers", "🏭"),
        item("/purchase/returns", "Purchase Returns", "↩️"),
      ]),
    ]),

    section("repair", "🔧 RepairFlow", [
      group("Tickets", [
        item("/repair", "All Tickets", "🎫"),
        item("/repair/new", "New Ticket", "➕"),
      ]),
      group("Devices", [
        item("/repair/devices/phones", "Phones", "📱"),
        item("/repair/devices/laptops", "Laptops", "💻"),
        item("/repair/devices/tvs", "TVs", "📺"),
        item("/repair/devices/consoles", "Consoles", "🎮"),
      ]),
      group("Diagnostics", [
        item("/repair/diagnostics", "Reports", "🩺"),
        item("/repair/diagnostics/tests", "Hardware Tests", "🧰"),
      ]),
      group("Parts & Warranty", [
        item("/repair/parts", "Spare Parts", "🔩"),
        item("/repair/parts/serial", "Serial / IMEI", "🆔"),
      ]),
      group("Billing", [
        item("/repair/billing", "Repair Invoices", "💳"),
      ]),
      group("Customer Portal", [
        item("/repair/portal", "Tracking", "🔎"),
      ]),
      group("Technician", [
        item("/repair/board", "Technician Board", "🧑‍🔧"),
      ]),
    ]),

    section("inventory", "📦 Inventory", [
      item("/inventory", "Stock", "📦"),
      item("/products", "Products", "🏷️"),
      item("/inventory/warehouses", "Warehouses", "🏬"),
      item("/inventory/movements", "Stock Movements", "🔁"),
      item("/inventory/pricing", "Smart Pricing", "💲"),
    ]),

    section("manufacturing", "🏭 Manufacturing", [
      item("/manufacturing/bom", "BOM", "🧱"),
      item("/manufacturing/orders", "Production Orders", "🛠️"),
      item("/manufacturing/centers", "Work Centers", "🏗️"),
    ]),

    section("crm", "👥 CRM Pro", [
      item("/customers", "Customers List", "👤"),
      item("/customers/new", "Add Customer", "➕"),
      item("/customers/crm", "Customer CRM", "💼"),
      item("/customers/credit", "Credit & Pay", "💳"),
      item("/partners", "Partners", "🤝"),
    ]),

    section("finance", "💰 Finance", [
      item("/finance", "Dashboard", "💹"),
      item("/expenses", "Expenses", "💳"),
      item("/finance/cashbank", "Cash / Bank", "🏦"),
      item("/receipts", "Receipts", "🧮"),
      group("Installments", [
        item("/finance/installments", "Installment Plans", "📆"),
      ]),
      group("Accounting", [
        item("/finance/journal", "Journal Entries", "📓"),
        item("/finance/accounts", "Chart of Accounts", "📚"),
      ]),
    ]),

    section("hrm", "🧑‍💼 HRM", [
      group("Employees", [
        item("/hr/employees", "Employees List", "👥"),
        item("/hr/employees/new", "Add Employee", "➕"),
      ]),
      group("Payroll & Time", [
        item("/hr/payroll", "Payroll", "💸"),
        item("/hr/timesheets", "Timesheets", "🗓️"),
      ]),
      group("Roles & Permissions", [
        item("/hr/roles", "Assign Roles", "🛡️"),
        item("/hr/roles/details", "Role Details", "🔐"),
      ]),
      group("Performance", [
        item("/hr/performance", "Reviews", "🏅"),
        item("/hr/kpis", "KPIs", "📊"),
      ]),
      group("Departments", [
        item("/hr/dept/hr", "HR", "👔"),
        item("/hr/dept/sales", "Sales", "💼"),
        item("/hr/dept/it", "IT", "💻"),
        item("/hr/dept/support", "Support", "🎧"),
      ]),
    ]),

    section("reports", "📑 Reports", [
      item("/reports/sales", "Sales Reports", "📈"),
      item("/reports/inventory", "Inventory Reports", "📦"),
      item("/reports/financial", "Financial Reports", "💰"),
    ]),

    section("admin", "⚙️ Administration", [
      group("Users", [
        item("/admin/users", "Users", "👤"),
        item("/admin/roles", "Roles", "🛡️"),
      ]),
      group("Branches", [
        item("/admin/branches", "Branch Management", "🏢"),
      ]),
      group("Templates", [
        item("/admin/templates", "Print Templates", "🖨️"),
      ]),
      group("System", [
        item("/system", "System Settings", "🛠️"),
        item("/admin/privacy", "Privacy Policy", "📜"),
        item("/admin/terms", "Terms & Conditions", "📄"),
      ]),
    ]),
  ];
}

const section = (id, label, children) => ({ id, label, children, type: "section" });
const group   = (label, children)       => ({ label, children, type: "group" });
const item    = (route, label, icon)    => ({ route, label, icon, type: "item" });

export function renderSidebar(root) {
  if (!root) return;
  root.innerHTML = `
    <div class="sidebar-root">
      <div class="brand"><span class="dot"></span> POS · ERP <span style="margin-left:auto;font-size:10px;color:#64748b;">v2026</span></div>
      <input class="sb-search" placeholder="🔎  Search…" />
      <div class="sb-menu">
        ${buildMenu().map(renderSection).join("")}
      </div>
    </div>
  `;
  bindEvents(root);
}

function renderSection(s) {
  const open = expanded.has(s.id);
  return `
    <div class="section ${open ? "open" : ""}" data-sec-id="${s.id}">
      <div class="section-title" data-section="${s.id}">
        <span>${s.label}</span>
        <span class="chev">▶</span>
      </div>
      <div class="section-body">
        ${s.children.map(renderNode).join("")}
      </div>
    </div>
  `;
}

function renderNode(n) {
  if (n.type === "group") {
    return `
      <div class="group">
        <div class="group-title">${n.label}</div>
        ${n.children.map(renderNode).join("")}
      </div>
    `;
  }
  const active = activeRoute === n.route ? "active" : "";
  return `
    <div class="item ${active}" data-route="${n.route}" data-label="${n.label}">
      <span class="ico">${n.icon || "•"}</span>
      <span class="lbl">${n.label}</span>
    </div>
  `;
}

function bindEvents(root) {
  root.querySelectorAll("[data-section]").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.section;
      if (expanded.has(id)) expanded.delete(id);
      else expanded.add(id);
      renderSidebar(root);
    };
  });

  root.querySelectorAll("[data-route]").forEach(el => {
    el.onclick = () => {
      const route = el.dataset.route;
      const label = el.dataset.label;
      activeRoute = route;
      try { renderLayout(route, label); } catch (err) { console.warn("nav failed:", err); }
      renderSidebar(root);
    };
  });

  const search = root.querySelector(".sb-search");
  if (search) {
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      root.querySelectorAll(".item").forEach(it => {
        const txt = it.querySelector(".lbl")?.textContent.toLowerCase() || "";
        it.style.display = !q || txt.includes(q) ? "flex" : "none";
      });
      // auto-open all sections when searching
      if (q) {
        root.querySelectorAll(".section").forEach(s => s.classList.add("open"));
      }
    };
  }
}
