// -------------------------------------
// MASTER DASHBOARD (INTELLIGENCE UI V4)
// -------------------------------------

import { runOrchestrator } from "../../core/orchestrator/intelligence.orchestrator.js";

import { subscribe } from "../../core/realtime/eventBus.js";
import { EVENTS } from "../../core/realtime/events.js";

import { simulateSales } from "../../core/simulation/simulation.engine.js";

let unsubscribe = null;

/* ================= HELPERS ================= */

function getRoot() {
  return document.getElementById("view") || document.getElementById("app");
}

function format(n) {
  return new Intl.NumberFormat().format(Number(n) || 0);
}

/* ================= CHART ================= */

function drawChart(canvas, revenue, forecast = []) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, w, h);

  const all = [...revenue, ...forecast];
  const max = Math.max(...all, 1);
  const step = w / (all.length - 1 || 1);

  function draw(data, color, dashed = false, offset = 0) {
    ctx.beginPath();
    ctx.setLineDash(dashed ? [6, 4] : []);

    data.forEach((v, i) => {
      const x = (i + offset) * step;
      const y = h - (v / max) * h;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  draw(revenue, "#22c55e");
  draw(forecast, "#f59e0b", true, revenue.length - 1);
}

/* ================= RENDER ================= */

async function render(data) {
  const root = getRoot();
  if (!root) return;

  const { signals = {}, actions = [], insights = {}, confidence = {} } = data;

  const finance = signals.finance || {};
  const forecast = signals.forecast || {};

  const revenue = (signals.inventory || []).map(i => i.sales?.revenue || 0);

  root.innerHTML = `
    <div class="dashboard-grid">

      <div class="card">
        <div class="card-title">Revenue</div>
        <div class="card-value">${format(finance.pnl?.revenue)}</div>
      </div>

      <div class="card">
        <div class="card-title">Net Profit</div>
        <div class="card-value">${format(finance.pnl?.netProfit)}</div>
      </div>

      <div class="card">
        <div class="card-title">Cash Balance</div>
        <div class="card-value">${format(finance.cash?.net)}</div>
      </div>

      <div class="card">
        <div class="card-title">Confidence</div>
        <div class="card-value">${((confidence.score || 0) * 100).toFixed(0)}%</div>
        <div style="opacity:0.6;font-size:12px;">
          ${confidence.level || "UNKNOWN"}
        </div>
      </div>

      <div class="panel">
        <div class="card-title">
          Market Intelligence (${insights.state || "UNKNOWN"})
        </div>

        <canvas id="chart" class="chart"></canvas>

        <div><b>Why:</b></div>
        ${insights.reasons?.map(r => `<div>- ${r}</div>`).join("") || "No data"}

        <div style="margin-top:10px;"><b>Recommendations:</b></div>
        ${insights.recommendations?.map(r => `<div>- ${r}</div>`).join("") || "No data"}
      </div>

      <div class="panel">
        <div class="card-title">Strategic Actions</div>

        ${
          actions.length
            ? actions.map(a => `
              <div style="margin-top:10px;">
                <b>${a.title || a.type}</b>
                <div>${a.message || ""}</div>
                <div style="font-size:12px;opacity:0.7;">
                  ${a.advice || ""}
                </div>
              </div>
            `).join("")
            : `<div>System stable</div>`
        }
      </div>

      <div class="panel">
        <div class="card-title">Simulation</div>

        <select id="sim-mode">
          <option value="REALISTIC">Realistic</option>
          <option value="GROWTH">Growth</option>
          <option value="DECLINE">Decline</option>
          <option value="VOLATILE">Volatile</option>
        </select>

        <button id="sim-run">Run</button>
        <button id="sim-reset">Reset</button>

        <div id="sim-status">Ready</div>
      </div>

    </div>
  `;

  drawChart(document.getElementById("chart"), revenue, forecast.next || []);

  document.getElementById("sim-run").onclick = async () => {
    const mode = document.getElementById("sim-mode").value;
    await simulateSales(mode);
    const newData = await runOrchestrator();
    render(newData);
  };

  document.getElementById("sim-reset").onclick = () => {
    indexedDB.deleteDatabase("pos_erp_db");
    location.reload();
  };
}

/* ================= ENTRY ================= */

export async function loadMasterDashboard() {
  const root = getRoot();
  if (!root) return;

  root.innerHTML = "Loading...";

  const refresh = async () => {
    const data = await runOrchestrator();
    render(data);
  };

  await refresh();

  if (unsubscribe) unsubscribe();
  unsubscribe = subscribe(EVENTS.SALE_CREATED, refresh);
}
