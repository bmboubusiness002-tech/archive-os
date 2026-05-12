// -------------------------------------
// BOOTSTRAP (COCKPIT ENTRY POINT)
// -------------------------------------

// ✅ FIXED PATH
import { startCockpit } from "./ui/layout/app.shell.js";

// 🔥 realtime engine
import { initRealtimeEngine } from "./core/realtime/realtime.engine.js";

/* ================= START ================= */

export function startApp() {
  const root = document.getElementById("app");

  if (!root) {
    console.error("❌ #app not found");
    return;
  }

  try {
    // 🔥 INIT REALTIME FIRST
    initRealtimeEngine();

    // 🔥 START UI
    startCockpit();

    console.log("🚀 COCKPIT READY (REALTIME ENABLED)");

  } catch (err) {
    console.error("❌ BOOT FAILED:", err);

    root.innerHTML = `
      <div style="color:red;padding:20px;">
        System failed to start
      </div>
    `;
  }
}
