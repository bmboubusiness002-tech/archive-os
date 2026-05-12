// Tiny shared UI helpers used by lightweight modules.

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

export function fmtMoney(n) { return (Number(n) || 0).toFixed(2); }

export function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

export function statsBar(items) {
  return `<div class="stats">${items.map(i => `
    <div>${escapeHtml(i.label)}<b style="${i.color ? `color:${i.color}` : ""}">${i.value}</b></div>
  `).join("")}</div>`;
}

export function emptyState(text) {
  return `<div style="padding:48px;text-align:center;color:#64748b;font-size:13px;">${escapeHtml(text)}</div>`;
}

export function panel(title, body, actions = "") {
  return `
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:18px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="margin:0;font-size:15px;color:#f1f5f9;">${title}</h3>
        <div>${actions}</div>
      </div>
      ${body}
    </div>
  `;
}

export function modal(title, bodyHtml, onSubmit) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  wrap.innerHTML = `
    <form style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;max-width:480px;width:100%;color:#e2e8f0;">
      <h3 style="margin:0 0 14px;font-size:16px;">${escapeHtml(title)}</h3>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:10px;">${bodyHtml}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;">
        <button type="button" data-act="cancel" style="background:#334155;">Cancel</button>
        <button type="submit" style="background:#22c55e;">Save</button>
      </div>
    </form>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-act=cancel]").onclick = () => wrap.remove();
  wrap.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const data = {};
    wrap.querySelectorAll("[name]").forEach(el => { data[el.name] = el.value; });
    Promise.resolve(onSubmit(data)).then(() => wrap.remove());
  };
  setTimeout(() => wrap.querySelector("input,select,textarea")?.focus(), 50);
  return wrap;
}
