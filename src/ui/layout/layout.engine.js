// Route dispatcher with graceful fallback for unimplemented screens.

import { createRouteRegistry } from "../../runtime/registry/route.registry.js";
import { updateWorkspaceState } from "../../runtime/state/runtime.state.js";

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

const routeDefinitions = {
  "/":                         { title: "Dashboard",            load: loadDashboard, domain: "dashboard" },

  "/pos":                      { title: "POS · Start Sale",     load: renderPOS, domain: "pos" },
  "/pos/sessions":             { title: "POS · Sessions",       load: renderSessions, domain: "pos" },
  "/pos/returns":              { title: "POS · Returns",        load: renderReturns, domain: "pos" },

  "/sales":                    { title: "Sales History",        load: renderSalesHistory, domain: "sales" },
  "/sales/invoices":           { title: "Invoices",             load: renderInvoices, domain: "sales" },
  "/sales/quotations":         { title: "Quotations",           load: renderQuotations, domain: "sales" },
  "/sales/payments":           { title: "Customer Payments",    load: renderPayments, domain: "sales" },
  "/receipts":                 { title: "Receipts",             load: renderInvoices, domain: "finance" },

  "/inventory":                { title: "Inventory · Stock",    load: renderInventory, domain: "inventory" },
  "/products":                 { title: "Catalog",              load: renderInventory, domain: "inventory" },
  "/inventory/warehouses":     { title: "Warehouses",           load: renderWarehouses, domain: "inventory" },
  "/inventory/movements":      { title: "Stock Movements",      load: renderMovements, domain: "inventory" },
  "/inventory/pricing":        { title: "Smart Pricing",        load: renderPricing, domain: "inventory" },

  "/manufacturing/bom":        { title: "Bills of Materials",   load: renderBOM, domain: "manufacturing" },
  "/manufacturing/orders":     { title: "Production Orders",    load: renderProductionOrders, domain: "manufacturing" },
  "/manufacturing/centers":    { title: "Work Centers",         load: renderWorkCenters, domain: "manufacturing" },

  "/customers/new":            { title: "Add Customer",         load: renderAddCustomer, domain: "crm" },
  "/customers/crm":            { title: "Customer CRM",         load: renderCustomerCRM, domain: "crm" },
  "/customers/credit":         { title: "Credit & Pay",         load: renderCredit, domain: "crm" },

  "/finance/cashbank":         { title: "Cash / Bank",          load: renderCashBank, domain: "finance" },
  "/finance/installments":     { title: "Installment Plans",    load: renderInstallments, domain: "finance" },
  "/finance/journal":          { title: "Journal Entries",      load: renderJournal, domain: "finance" },
  "/finance/accounts":         { title: "Chart of Accounts",    load: renderAccounts, domain: "finance" },

  "/hr/employees":             { title: "Employees",            load: renderEmployees, domain: "hr" },
  "/hr/employees/new":         { title: "Add Employee",         load: renderAddEmployee, domain: "hr" },
  "/hr/payroll":               { title: "Payroll",              load: renderPayroll, domain: "hr" },
  "/hr/timesheets":            { title: "Timesheets",           load: renderTimesheets, domain: "hr" },
  "/hr/roles":                 { title: "Roles",                load: renderRoles, domain: "hr" },
  "/hr/roles/details":         { title: "Role Details",         load: renderRoleDetails, domain: "hr" },
  "/hr/performance":           { title: "Performance Reviews",  load: renderPerformance, domain: "hr" },
  "/hr/kpis":                  { title: "KPIs",                 load: renderKPIs, domain: "hr" },
  "/hr/dept/hr":               { title: "Dept · HR",            load: renderDepartment("hr"), domain: "hr" },
  "/hr/dept/sales":            { title: "Dept · Sales",         load: renderDepartment("sales"), domain: "hr" },
  "/hr/dept/it":               { title: "Dept · IT",            load: renderDepartment("it"), domain: "hr" },
  "/hr/dept/support":          { title: "Dept · Support",       load: renderDepartment("support"), domain: "hr" },

  "/purchase":                 { title: "Purchase Orders",      load: renderPurchaseOrders, domain: "purchase" },
  "/purchase/suppliers":       { title: "Suppliers",            load: renderSuppliers, domain: "purchase" },
  "/purchase/returns":         { title: "Purchase Returns",     load: renderPurchaseReturns, domain: "purchase" },

  "/intelligence":             { title: "Intelligence",         load: loadIntelligence, domain: "intelligence" },
  "/intelligence/predictive":  { title: "Predictive Analytics", load: renderPredictive, domain: "intelligence" },
  "/intelligence/strategy":    { title: "Strategy Advisor",     load: renderStrategy, domain: "intelligence" },
  "/intelligence/scenarios":   { title: "Scenario Simulation",  load: renderScenarios, domain: "intelligence" },

  "/customers":                { title: "Customers",            load: loadPeople, domain: "crm" },
  "/partners":                 { title: "Partners",             load: loadPeople, domain: "crm" },
  "/finance":                  { title: "Finance Dashboard",    load: loadTransactions, domain: "finance" },
  "/expenses":                 { title: "Expenses",             load: loadTransactions, domain: "finance" },

  "/repair":                       { title: "Repair Tickets",      load: renderRepairTickets(), domain: "repair" },
  "/repair/new":                   { title: "New Repair Ticket",   load: renderRepairTickets(), domain: "repair" },
  "/repair/devices/phones":        { title: "Phone repairs",       load: renderRepairTickets("phone"), domain: "repair" },
  "/repair/devices/laptops":       { title: "Laptop repairs",      load: renderRepairTickets("laptop"), domain: "repair" },
  "/repair/devices/tvs":           { title: "TV repairs",          load: renderRepairTickets("tv"), domain: "repair" },
  "/repair/devices/consoles":      { title: "Console repairs",     load: renderRepairTickets("console"), domain: "repair" },
  "/repair/diagnostics":           { title: "Diagnostic Reports",  load: renderDiagnostics, domain: "repair" },
  "/repair/diagnostics/tests":     { title: "Hardware Tests",      load: renderTests, domain: "repair" },
  "/repair/parts":                 { title: "Spare Parts",         load: renderParts, domain: "repair" },
  "/repair/parts/serial":          { title: "Serial / IMEI",       load: renderSerialLookup, domain: "repair" },
  "/repair/billing":               { title: "Repair Invoices",     load: renderRepairBilling, domain: "repair" },
  "/repair/portal":                { title: "Customer Tracking",   load: renderPortal, domain: "repair" },
  "/repair/board":                 { title: "Technician Board",    load: renderBoard, domain: "repair" },

  "/reports/sales":                { title: "Sales Reports",       load: renderSalesReport, domain: "reports" },
  "/reports/inventory":            { title: "Inventory Reports",   load: renderInventoryReport, domain: "reports" },
  "/reports/financial":            { title: "Financial Reports",   load: renderFinancialReport, domain: "reports" },

  "/admin/users":                  { title: "Users",               load: renderUsers, domain: "admin" },
  "/admin/roles":                  { title: "Admin Roles",         load: renderAdminRoles, domain: "admin" },
  "/admin/branches":               { title: "Branch Management",   load: renderBranches, domain: "admin" },
  "/admin/templates":              { title: "Print Templates",     load: renderTemplates, domain: "admin" },
  "/admin/privacy":                { title: "Privacy Policy",      load: renderPrivacy, domain: "admin" },
  "/admin/terms":                  { title: "Terms & Conditions",  load: renderTerms, domain: "admin" },

  "/system":                       { title: "System",              load: renderSystem, domain: "system" },
};

const routeRegistry = createRouteRegistry(routeDefinitions);

export async function renderLayout(route, label) {
  const view = document.getElementById("view");
  const title = document.getElementById("screen-title");

  if (!view) {
    console.error("❌ #view not found");
    return;
  }

  view.innerHTML = "";

  const definition = routeRegistry.get(route);

  updateWorkspaceState({
    currentRoute: route,
    currentLabel: label || definition?.title || "Module",
    currentDomain: definition?.domain || null,
    lastRouteChangeAt: Date.now()
  });

  if (definition) {
    if (title) {
      title.textContent = definition.title;
    }

    try {
      return await definition.load(view);
    } catch (error) {
      console.warn("screen failed, showing placeholder:", error);
      renderComingSoon(view, definition.title, route, error);
    }

    return;
  }

  if (title) {
    title.textContent = label || "Module";
  }

  renderComingSoon(view, label || route, route);
}

export function getRouteRegistry() {
  return routeRegistry;
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
