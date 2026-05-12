// Cashier sessions: open/close session, track sales during the session.
import { db } from "./pos.db.js";
import { on } from "./pos.events.js";
import { fmtMoney, fmtDate, statsBar, panel, emptyState, modal } from "../_shared/ui.js";

let off = null;

export async function renderSessions(view) {
  await draw(view);
  if (off) off();
  off = on("sale:created", () => draw(view));
}

async function draw(view) {
  const sessions = await db.sessions.orderBy("openedAt").reverse().toArray();
  const open = sessions.find(s => s.status === "open");
  const sales = await db.sales.toArray();

  // Compute totals per session window
  for (const s of sessions) {
    const end = s.closedAt || Date.now();
    const inWindow = sales.filter(sl => sl.createdAt >= s.openedAt && sl.createdAt <= end);
    s._sales = inWindow.length;
    s._total = inWindow.reduce((a, b) => a + b.total, 0);
  }

  view.innerHTML = `
    ${statsBar([
      { label: "Open session", value: open ? `#${open.id}` : "—", color: open ? "#4ade80" : "#64748b" },
      { label: "Total sessions", value: sessions.length },
      { label: "All sessions revenue", value: fmtMoney(sessions.reduce((a, s) => a + s._total, 0)) },
    ])}

    ${panel(
      open ? `Open session #${open.id}` : "No open session",
      open ? `
        <div style="display:flex;justify-content:space-between;gap:16px;">
          <div>Opened: <b>${fmtDate(open.openedAt)}</b></div>
          <div>Sales: <b>${open._sales}</b></div>
          <div>Revenue: <b style="color:#4ade80;">${fmtMoney(open._total)}</b></div>
        </div>
      ` : emptyState("Open a session before processing sales."),
      open
        ? `<button id="close-sess" style="background:#ef4444;">Close session</button>`
        : `<button id="open-sess" style="background:#22c55e;">Open new session</button>`
    )}

    ${panel("History", sessions.length ? `
      <table>
        <thead><tr><th>#</th><th>Opened</th><th>Closed</th><th>Sales</th><th>Revenue</th><th>Status</th></tr></thead>
        <tbody>${sessions.map(s => `
          <tr>
            <td>#${s.id}</td>
            <td>${fmtDate(s.openedAt)}</td>
            <td>${fmtDate(s.closedAt)}</td>
            <td>${s._sales}</td>
            <td>${fmtMoney(s._total)}</td>
            <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${s.status === "open" ? "rgba(34,197,94,0.2)" : "#1e293b"};color:${s.status === "open" ? "#4ade80" : "#94a3b8"};">${s.status}</span></td>
          </tr>
        `).join("")}</tbody>
      </table>
    ` : emptyState("No sessions yet."))}
  `;

  view.querySelector("#open-sess")?.addEventListener("click", () => {
    modal("Open new session", `
      <label>Opening cash<input name="openingCash" type="number" value="0" required></label>
    `, async (data) => {
      await db.sessions.add({
        openedAt: Date.now(),
        closedAt: null,
        openingCash: Number(data.openingCash) || 0,
        status: "open"
      });
      draw(view);
    });
  });

  view.querySelector("#close-sess")?.addEventListener("click", () => {
    modal(`Close session #${open.id}`, `
      <div style="font-size:12px;color:#94a3b8;">Counted closing cash:</div>
      <label><input name="closingCash" type="number" value="${(open.openingCash || 0) + (open._total || 0)}" required></label>
    `, async (data) => {
      await db.sessions.update(open.id, {
        closedAt: Date.now(),
        closingCash: Number(data.closingCash) || 0,
        status: "closed"
      });
      draw(view);
    });
  });
}
