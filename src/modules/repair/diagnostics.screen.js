// Diagnostics: list of recorded reports + a quick "hardware tests" recorder linked to tickets.
import { db } from "../pos/pos.db.js";
import { ensureRepairSeed } from "./repair.db.js";
import { fmtDate, statsBar, panel, emptyState, escapeHtml } from "../_shared/ui.js";
import { safeQuery, safeSetHTML, isMounted } from "../../core/ui/safe-dom.js";

const TESTS = [
  "Display", "Touchscreen", "Battery health", "Charging port",
  "Speakers", "Microphone", "Wi‑Fi", "Bluetooth", "Cameras", "Buttons"
];

export async function renderDiagnostics(view) {
  if (!view) return;

  await ensureRepairSeed();
  await drawList(view);
}

async function drawList(view) {
  if (!isMounted(view)) return;

  const reports = await db.repair_diagnostics.orderBy("createdAt").reverse().toArray();
  const tickets = await db.repair_tickets.toArray();
  const tIndex = Object.fromEntries(tickets.map(t => [t.id, t]));

  view.innerHTML = `
    ${statsBar([
      { label: "Reports", value: reports.length },
      { label: "Linked tickets", value: new Set(reports.map(r => r.ticketId)).size },
    ])}
    ${panel("Diagnostic reports", reports.length ? `
      <table>
        <thead><tr><th>Date</th><th>Ticket</th><th>Customer</th><th>Pass</th><th>Fail</th><th>Summary</th></tr></thead>
        <tbody>${reports.map(r => {
          const t = tIndex[r.ticketId] || {};
          const pass = (r.tests || []).filter(x => x.result === "pass").length;
          const fail = (r.tests || []).filter(x => x.result === "fail").length;
          return `
            <tr>
              <td>${fmtDate(r.createdAt)}</td>
              <td>${escapeHtml(t.code || "—")}</td>
              <td>${escapeHtml(t.customer || "—")}</td>
              <td style="color:#4ade80;">${pass}</td>
              <td style="color:#f87171;">${fail}</td>
              <td style="font-size:12px;color:#cbd5f5;">${escapeHtml(r.summary || "")}</td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    ` : emptyState("No diagnostic reports yet."))}
  `;
}

export async function renderTests(view) {
  if (!view) return;

  await ensureRepairSeed();

  const tickets = await db.repair_tickets
    .where("status")
    .anyOf("new", "diagnosing", "repairing", "awaiting_parts")
    .toArray();

  view.innerHTML = `
    ${panel("Run hardware tests", tickets.length ? `
      <label>Ticket
        <select id="dt-ticket">${tickets.map(t => `<option value="${t.id}">${t.code} — ${escapeHtml(t.customer)} (${escapeHtml(t.deviceType)})</option>`).join("")}</select>
      </label>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:14px;">
        ${TESTS.map(t => `
          <div style="background:#1e293b;padding:10px;border-radius:8px;">
            <div style="font-size:13px;font-weight:600;margin-bottom:6px;">${t}</div>
            <div style="display:flex;gap:6px;" data-test="${t}">
              <label style="font-size:11px;"><input type="radio" name="t-${t}" value="pass" checked> Pass</label>
              <label style="font-size:11px;"><input type="radio" name="t-${t}" value="fail"> Fail</label>
              <label style="font-size:11px;"><input type="radio" name="t-${t}" value="skip"> Skip</label>
            </div>
          </div>
        `).join("")}
      </div>
      <label style="margin-top:14px;">Summary / notes<textarea id="dt-summary" rows="2"></textarea></label>
      <div style="margin-top:14px;text-align:right;">
        <button id="dt-save" style="background:#22c55e;">Save report</button>
      </div>
    ` : emptyState("No active tickets to test. Open a ticket first."))}
    <div id="dt-status"></div>
  `;

  const saveBtn = safeQuery(view, "#dt-save");

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const ticketSelect = safeQuery(view, "#dt-ticket");
      const summaryField = safeQuery(view, "#dt-summary");

      if (!ticketSelect || !summaryField) {
        console.warn("diagnostics screen missing form nodes");
        return;
      }

      const ticketId = Number(ticketSelect.value);

      const tests = TESTS.map(t => {
        const v = safeQuery(view, `[data-test="${t}"] input:checked`);

        return {
          name: t,
          result: v ? v.value : "skip"
        };
      });

      const summary = summaryField.value;

      await db.repair_diagnostics.add({
        ticketId,
        createdAt: Date.now(),
        tests,
        summary
      });

      const ticket = await db.repair_tickets.get(ticketId);

      if (ticket && ticket.status === "new") {
        await db.repair_tickets.update(ticketId, {
          status: "diagnosing"
        });
      }

      safeSetHTML(
        view,
        "#dt-status",
        `<div style="margin-top:14px;background:rgba(34,197,94,0.15);color:#4ade80;padding:10px;border-radius:8px;text-align:center;">✅ Report saved</div>`
      );

      setTimeout(() => {
        if (!isMounted(view)) {
          return;
        }

        safeSetHTML(view, "#dt-status", "");
      }, 2400);
    };
  }
}
