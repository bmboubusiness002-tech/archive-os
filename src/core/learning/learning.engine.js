// -------------------------------------
// LEARNING ENGINE V2 (Adaptive + Memory)
// -------------------------------------

/*
الهدف:
✔ يتعلم من قراراتك
✔ يتذكر النتائج
✔ يعدل سلوكه تدريجيًا
*/

const KEY = "ai-profile";
const HISTORY_KEY = "ai-learning-history";

/* ================= STORAGE ================= */

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function saveProfile(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-50))); // keep last 50
}

/* ================= CORE ================= */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* =========================================
   MAIN LEARNING FUNCTION
========================================= */

export function updateLearning({ actions = [], outcome = {} }) {
  const profile = loadProfile();
  const history = loadHistory();

  let confidenceBoost = profile.confidenceBoost || 0;
  let riskTolerance = profile.riskTolerance || 0;

  actions.forEach(a => {
    const entry = {
      type: a.type,
      outcome,
      ts: Date.now()
    };

    history.push(entry);

    // ================= PURCHASE =================
    if (a.type === "PURCHASE") {
      if (outcome.success) {
        confidenceBoost += 0.05;
        riskTolerance += 0.03;
      }

      if (outcome.failed) {
        confidenceBoost -= 0.08;
        riskTolerance -= 0.05;
      }
    }

    // ================= ALERT =================
    if (a.type === "ALERT") {
      if (outcome.ignored) {
        riskTolerance += 0.02; // أنت جريء
      }

      if (outcome.respected) {
        riskTolerance -= 0.03; // أنت محافظ
      }
    }
  });

  // clamp values
  confidenceBoost = clamp(confidenceBoost, -1, 1);
  riskTolerance = clamp(riskTolerance, -1, 1);

  const newProfile = {
    ...profile,
    confidenceBoost,
    riskTolerance,
    lastUpdated: Date.now()
  };

  saveProfile(newProfile);
  saveHistory(history);

  return newProfile;
}

/* =========================================
   READ PROFILE
========================================= */

export function getProfile() {
  return loadProfile();
}

/* =========================================
   ANALYTICS (اختياري لكن مهم)
========================================= */

export function getLearningStats() {
  const history = loadHistory();

  const total = history.length;

  const success = history.filter(h => h.outcome?.success).length;
  const failed = history.filter(h => h.outcome?.failed).length;

  return {
    total,
    success,
    failed,
    successRate: total ? success / total : 0
  };
}
