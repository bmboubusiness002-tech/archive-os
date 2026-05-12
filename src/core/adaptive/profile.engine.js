// -------------------------------------
// ADAPTIVE PROFILE ENGINE
// -------------------------------------

import { ProfileRepo } from "../../domain/adaptive/profile.repo.js";
import { openDB } from "../../infra/db/db.js";

/* ================= DEFAULT ================= */

function defaultProfile() {
  return {
    buyBias: 0,      // -1 → +1
    ignoreBias: 0,
    confidenceBoost: 0
  };
}

/* ================= BUILD ================= */

function computeProfile(decisions = []) {
  let buy = 0;
  let ignore = 0;
  let watch = 0;

  for (const d of decisions) {
    if (d.action === "BUY") buy++;
    if (d.action === "IGNORE") ignore++;
    if (d.action === "WATCH") watch++;
  }

  const total = buy + ignore + watch || 1;

  const buyRate = buy / total;
  const ignoreRate = ignore / total;

  return {
    buyBias: buyRate,
    ignoreBias: ignoreRate,
    confidenceBoost: buyRate - ignoreRate
  };
}

/* ================= UPDATE ================= */

export async function updateAdaptiveProfile(decisions) {
  const db = await openDB();
  const repo = new ProfileRepo();

  const profile = computeProfile(decisions);

  await repo.saveProfile(db, profile);

  console.log("🧠 Profile updated:", profile);

  return profile;
}

/* ================= LOAD ================= */

export async function loadAdaptiveProfile() {
  const db = await openDB();
  const repo = new ProfileRepo();

  const profile = await repo.getProfile(db);

  return profile || defaultProfile();
}

/* ================= APPLY ================= */

export function applyProfileAdjustment(confidence, suggestion, profile) {
  if (!profile) return { confidence, suggestion };

  let newConfidence = confidence;

  if (profile.confidenceBoost > 0.3) {
    if (confidence === "WEAK") newConfidence = "MEDIUM";
    if (confidence === "MEDIUM") newConfidence = "STRONG";
  }

  if (profile.confidenceBoost < -0.3) {
    if (confidence === "STRONG") newConfidence = "MEDIUM";
    if (confidence === "MEDIUM") newConfidence = "WEAK";
  }

  return {
    confidence: newConfidence,
    suggestion
  };
}
