// Route dispatcher with graceful fallback for unimplemented screens.

import { loadDashboard }    from "../screens/dashboard.screen.js";
import { loadOperations }   from "../screens/operations.screen.js";
import { loadPeople }       from "../screens/people.screen.js";
import { loadSystem }       from "../screens/system.screen.js";
import { loadTransactions } from "../screens/transactions.screen.js";
import { loadIntelligence } from "../screens/intelligence.screen.js";

import { renderPOS }            from "../../modules/pos/pos.screen.js";
import { renderSessions }       from "../../modules/pos/sessions.screen.js";
import { renderReturns }        from "../../modules/pos/returns.screen.js";
import { renderInventory }      from "../../modules/inventory/inventory.screen.js";

import { renderSalesHistory }   from "../../modules/sales/history.screen.js";
import { renderInvoices }       from "../../modules/sales/invoices.screen.js";
import { renderQuotations }     from "../../modules/sales/quotations.screen.js";
import { renderPayments }       from "../../modules/sales/payments.screen.js";

import { renderPurchaseOrders } from "../../modules/purchase/orders.screen.js";
import { renderSuppliers }      from "../../modules/purchase/suppliers.screen.js";
import { renderPurchaseReturns } from "../../modules/purchase/returns.screen.js";

import { renderPredictive }     from "../../modules/intelligence/predictive.screen.js";
import { renderStrategy }       from "../../modules/intelligence/strategy.screen.js";
import { renderScenarios }      from "../../modules/intelligence/scenarios.screen.js";

import { renderRepairTickets }            from "../../modules/repair/tickets.screen.js";
import { renderDiagnostics, renderTests } from "../../modules/repair/diagnostics.screen.js";
import { renderParts, renderSerialLookup }from "../../modules/repair/parts.screen.js";
import { renderRepairBilling }            from "../../modules/repair/billing.screen.js";
import { renderPortal }                   from "../../modules/repair/portal.screen.js";
import { renderBoard }                    from "../../modules/repair/board.screen.js";

import { renderWarehouses, renderMovements, renderPricing } from "../../modules/inventory/extras.screen.js";
import { renderBOM, renderProductionOrders, renderWorkCenters } from "../../modules/manufacturing/manufacturing.screen.js";
import { renderAddCustomer, renderCustomerCRM, renderCredit } from "../../modules/crm/crm.screen.js";
import { renderCashBank, renderInstallments, renderJournal, renderAccounts } from "../../modules/finance/finance.screen.js";
import {
  renderEmployees, renderAddEmployee, renderPayroll, renderTimesheets,
  renderRoles, renderRoleDetails, renderPerformance, renderKPIs, renderDepartment
} from "../../modules/hr/hr.screen.js";

import { renderSalesReport, renderInventoryReport, renderFinancialReport } from "../../modules/reports/reports.screen.js";
import {
  renderUsers, renderAdminRoles, renderBranches, renderTemplates,
  renderSystem, renderPrivacy, renderTerms
} from "../../modules/admin/admin.screen.js";

const routes = {
  "/":                         { title: "Dashboard",            load: loadDashboard },

  // POS
  "/pos":                      { title: "POS · Start Sale",     load: renderPOS },
  "/pos/sessions":             { title: "POS · Sessions",       load: renderSessions },
  "/pos/returns":              { title: "POS · Returns",        load: renderReturns },

  // Sales
  "/sales":                    { title: "Sales History",        load: renderSalesHistory },
  "/sales/invoices":           { title: "Invoices",             load: renderInvoices },
  "/sales/quotations":         { title: "Quotations",           load: renderQuotations },
  "/sales/payments":           { title: "Customer Payments",    load: renderPayments },
  "/receipts":                 { title: "Receipts",             load: renderInvoices },

  // Inventory
  "/inventory":                { title: "Inventory · Stock",    load: renderInventory },
  "/products":                 { title: "Catalog",              load: renderInventory },
  "/inventory/warehouses":     { title: "Warehouses",           load: renderWarehouses },
  "/inventory/movements":      { title: "Stock Movements",      load: renderMovements },
  "/inventory/pricing":        { title: "Smart Pricing",        load: renderPricing },

  // Manufacturing
  "/manufacturing/bom":        { title: "Bills of Materials",   load: renderBOM },
  "/manufacturing/orders":     { title: "Production Orders",    load: renderProductionOrders },
  "/manufacturing/centers":    { title: "Work Centers",         load: renderWorkCenters },

  // CRM Pro
  "/customers/new":            { title: "Add Customer",         load: renderAddCustomer },
  "/customers/crm":            { title: "Customer CRM",         load: renderCustomerCRM },
  "/customers/credit":         { title: "Credit & Pay",         load: renderCredit },

  // Finance extras
  "/finance/cashbank":         { title: "Cash / Bank",          load: renderCashBank },
  "/finance/installments":     { title: "Installment Plans",    load: renderInstallments },
  "/finance/journal":          { title: "Journal Entries",      load: renderJournal },
  "/finance/accounts":         { title: "Chart of Accounts",    load: renderAccounts },

  // HRM
  "/hr/employees":             { title: "Employees",            load: renderEmployees },
  "/hr/employees/new":         { title: "Add Employee",         load: renderAddEmployee },
  "/hr/payroll":               { title: "Payroll",              load: renderPayroll },
  "/hr/timesheets":            { title: "Timesheets",           load: renderTimesheets },
  "/hr/roles":                 { title: "Roles",                load: renderRoles },
  "/hr/roles/details":         { title: "Role Details",         load: renderRoleDetails },
  "/hr/performance":           { title: "Performance Reviews",  load: renderPerformance },
  "/hr/kpis":                  { title: "KPIs",                 load: renderKPIs },
  "/hr/dept/hr":               { title: "Dept · HR",            load: renderDepartment("hr") },
  "/hr/dept/sales":            { title: "Dept · Sales",         load: renderDepartment("sales") },
  "/hr/dept/it":               { title: "Dept · IT",            load: renderDepartment("it") },
  "/hr/dept/support":          { title: "Dept · Support",       load: renderDepartment("support") },

  // Purchases
  "/purchase":                 { title: "Purchase Orders",      load: renderPurchaseOrders },
  "/purchase/suppliers":       { title: "Suppliers",            load: renderSuppliers },
  "/purchase/returns":         { title: "Purchase Returns",     load: renderPurchaseReturns },

  // Intelligence
  "/intelligence":             { title: "Intelligence",         load: loadIntelligence },
  "/intelligence/predictive":  { title: "Predictive Analytics", load: renderPredictive },
  "/intelligence/strategy":    { title: "Strategy Advisor",     load: renderStrategy },
  "/intelligence/scenarios":   { title: "Scenario Simulation",  load: renderScenarios },

  // Misc
  "/customers":                { title: "Customers",            load: loadPeople },
  "/partners":                 { title: "Partners",             load: loadPeople },
  "/finance":                  { title: "Finance Dashboard",    load: loadTransactions },
  "/expenses":                 { title: "Expenses",             load: loadTransactions },
  // Repair
  "/repair":                       { title: "Repair Tickets",      load: renderRepairTickets() },
  "/repair/new":                   { title: "New Repair Ticket",   load: renderRepairTickets() },
  "/repair/devices/phones":        { title: "Phone repairs",       load: renderRepairTickets("phone") },
  "/repair/devices/laptops":       { title: "Laptop repairs",      load: renderRepairTickets("laptop") },
  "/repair/devices/tvs":           { title: "TV repairs",          load: renderRepairTickets("tv") },
  "/repair/devices/consoles":      { title: "Console repairs",     load: renderRepairTickets("console") },
  "/repair/diagnostics":           { title: "Diagnostic Reports",  load: renderDiagnostics },
  "/repair/diagnostics/tests":     { title: "Hardware Tests",      load: renderTests },
  "/repair/parts":                 { title: "Spare Parts",         load: renderParts },
  "/repair/parts/serial":          { title: "Serial / IMEI",       load: renderSerialLookup },
  "/repair/billing":               { title: "Repair Invoices",     load: renderRepairBilling },
  "/repair/portal":                { title: "Customer Tracking",   load: renderPortal },
  "/repair/board":                 { title: "Technician Board",    load: renderBoard },

  // Reports
  "/reports/sales":                { title: "Sales Reports",       load: renderSalesReport },
  "/reports/inventory":            { title: "Inventory Reports",   load: renderInventoryReport },
  "/reports/financial":            { title: "Financial Reports",   load: renderFinancialReport },

  // Admin
  "/admin/users":                  { title: "Users",               load: renderUsers },
  "/admin/roles":                  { title: "Admin Roles",         load: renderAdminRoles },
  "/admin/branches":               { title: "Branch Management",   load: renderBranches },
  "/admin/templates":              { title: "Print Templates",     load: renderTemplates },
  "/admin/privacy":                { title: "Privacy Policy",      load: renderPrivacy },
  "/admin/terms":                  { title: "Terms & Conditions",  load: renderTerms },

  "/system":                       { title: "System",              load: renderSystem },
};

export async function renderLayout(route, label) {
  const view  = document.getElementById("view");
  const title = document.getElementById("screen-title");
  if (!view) { console.error("❌ #view not found"); return; }

  view.innerHTML = "";

  const def = routes[route];
  if (def) {
    if (title) title.textContent = def.title;
    try {
      return await def.load(view);
    } catch (err) {
      console.warn("screen failed, showing placeholder:", err);
      renderComingSoon(view, def.title, route, err);
    }
    return;
  }

  if (title) title.textContent = label || "Module";
  renderComingSoon(view, label || route, route);
}

function renderComingSoon(view, label, route, err) {
  view.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                height:100%;text-align:center;padding:48px;color:#94a3b8;">
      <div style="font-size:54px;margin-bottom:14px;">🚧</div>
      <h2 style="margin:0 0 6px;color:#f1f5f9;">${escapeHtml(label)}</h2>
      <div style="font-size:13px;opacity:0.7;margin-bottom:18px;">
        Route <code style="background:#1e293b;padding:2px 6px;border-radius:4px;">${escapeHtml(route)}</code>
        is reserved in the navigation but not implemented yet.
      </div>
      ${err ? `<pre style="margin-top:18px;font-size:11px;color:#f87171;background:#1e293b;padding:10px;border-radius:8px;max-width:600px;overflow:auto;">${escapeHtml(String(err))}</pre>` : ""}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}
