// -------------------------------------
// UX ENGINE (MASTER)
// -------------------------------------

import { extractUXSignals } from "./ux.signals.js";
import { decideUX } from "./ux.rules.js";

export function runUXEngine({ dashboard, pos = {}, context = {} }) {
  try {
    const signals = extractUXSignals({
      dashboard,
      pos,
      context
    });

    const decision = decideUX({ signals });

    return {
      signals,
      decision
    };
  } catch (e) {
    console.warn("UX Engine failed", e);

    return {
      signals: [],
      decision: {
        mode: "normal"
      }
    };
  }
}
