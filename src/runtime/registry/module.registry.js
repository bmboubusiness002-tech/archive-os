const item = (route, label, icon, meta = {}) => ({ route, label, icon, type: "item", ...meta });
const group = (label, children, meta = {}) => ({ label, children, type: "group", ...meta });
const section = (id, label, children, meta = {}) => ({ id, label, children, type: "section", ...meta });

export const runtimeModuleRegistry = [
  section("intelligence", "🧠 Intelligence", [
    item("/", "Overview", "📊", { capability: "dashboard.overview" }),
    item("/intelligence/predictive", "Predictive Analytics", "🔮", { capability: "intelligence.predictive" }),
    item("/intelligence/strategy", "Strategy Advisor", "🧭", { capability: "intelligence.strategy" }),
    item("/intelligence/scenarios", "Scenario Simulation", "🧪", { capability: "intelligence.scenarios" }),
  ]),

  section("operations", "🛒 Operations", [
    group("POS", [
      item("/pos", "Start Sale", "🧾", { capability: "pos.sale.start" }),
      item("/pos/sessions", "Sessions", "🕒", { capability: "pos.sessions" }),
      item("/pos/returns", "Returns", "↩️", { capability: "pos.returns" }),
    ], { domain: "pos" }),
    group("Sales", [
      item("/sales", "Sales History", "📈", { capability: "sales.history" }),
      item("/sales/invoices", "Invoices", "🧾", { capability: "sales.invoices" }),
      item("/sales/quotations", "Quotations", "📝", { capability: "sales.quotations" }),
      item("/sales/payments", "Customer Payments", "💵", { capability: "sales.payments" }),
    ], { domain: "sales" }),
    group("Purchases", [
      item("/purchase", "Purchase Orders", "🛍️", { capability: "purchase.orders" }),
      item("/purchase/suppliers", "Suppliers", "🏭", { capability: "purchase.suppliers" }),
      item("/purchase/returns", "Purchase Returns", "↩️", { capability: "purchase.returns" }),
    ], { domain: "purchase" }),
  ]),

  section("repair", "🔧 RepairFlow", [
    group("Tickets", [
      item("/repair", "All Tickets", "🎫"),
      item("/repair/new", "New Ticket", "➕"),
    ]),
    group("Diagnostics", [
      item("/repair/diagnostics", "Reports", "🩺"),
      item("/repair/diagnostics/tests", "Hardware Tests", "🧰"),
    ]),
    group("Parts & Warranty", [
      item("/repair/parts", "Spare Parts", "🔩"),
      item("/repair/parts/serial", "Serial / IMEI", "🆔"),
    ]),
    group("Billing", [item("/repair/billing", "Repair Invoices", "💳")]),
    group("Customer Portal", [item("/repair/portal", "Tracking", "🔎")]),
    group("Technician", [item("/repair/board", "Technician Board", "🧑‍🔧")]),
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
    group("Installments", [item("/finance/installments", "Installment Plans", "📆")]),
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
    group("Branches", [item("/admin/branches", "Branch Management", "🏢")]),
    group("Templates", [item("/admin/templates", "Print Templates", "🖨️")]),
    group("System", [
      item("/system", "System Settings", "🛠️"),
      item("/admin/privacy", "Privacy Policy", "📜"),
      item("/admin/terms", "Terms & Conditions", "📄"),
    ]),
  ]),
];

export function getRuntimeModuleRegistry() {
  return runtimeModuleRegistry;
}

export function flattenRuntimeRoutes(nodes = runtimeModuleRegistry) {
  return nodes.flatMap((node) => {
    if (node.type === "item") return [node];
    return flattenRuntimeRoutes(node.children || []);
  });
}

export function findRuntimeRoute(route) {
  return flattenRuntimeRoutes().find((entry) => entry.route === route) || null;
}
