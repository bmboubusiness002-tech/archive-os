// -------------------------------------
// MEMORY ENGINE (Learning Timeline)
// -------------------------------------

import { saveMemory, getMemory } from "./memory.repo.js";

/* ================= SAVE ================= */

export async function recordSnapshot(data) {
  try {
    return await saveMemory({
      timestamp: new Date().toISOString(),
      ...data
    });
  } catch (e) {
    console.warn("Memory save failed", e);
  }
}

/* ================= LOAD ================= */

export async function loadHistory() {
  try {
    return await getMemory(100);
  } catch (e) {
    console.warn("Memory load failed", e);
    return [];
  }
}

/* ================= ANALYSIS ================= */

export function analyzeMemory(history = []) {
  if (!history.length) {
    return {
      trend: "NONE",
      confidenceTrend: "UNKNOWN"
    };
  }

  const revenues = history.map(h => h.signals?.finance?.pnl?.revenue || 0);
  const confidences = history.map(h => h.confidence?.score || 0);

  const trend =
    revenues[revenues.length - 1] > revenues[0]
      ? "UP"
      : revenues[revenues.length - 1] < revenues[0]
      ? "DOWN"
      : "FLAT";

  const confidenceTrend =
    confidences[confidences.length - 1] > confidences[0]
      ? "IMPROVING"
      : "DECLINING";

  return {
    trend,
    confidenceTrend
  };
}
