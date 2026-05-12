// -------------------------------------
// ACCOUNTING REPORT ENGINE (V2 PRO)
// PERIODS + GROUPING + DRILLDOWN
// -------------------------------------

// --------- PERIOD HELPERS ---------

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(ts) {
  const d = new Date(ts);
  const day = d.getDay() || 7; // 1..7
  if (day !== 1) d.setHours(-24 * (day - 1));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonth(ts) {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function bucketKey(ts, period) {
  if (period === "day") return startOfDay(ts);
  if (period === "week") return startOfWeek(ts);
  if (period === "month") return startOfMonth(ts);
  return startOfDay(ts); // default
}

function inRange(ts, from, to) {
  if (from && ts < from) return false;
  if (to && ts > to) return false;
  return true;
}

// --------- CORE AGG ---------

function aggBase() {
  return {
    revenue: 0,
    cogs: 0,
    expenses: 0,
    cashIn: 0,
    cashOut: 0,
    count: 0
  };
}

function applyEntry(acc, e) {
  const a = Number(e.amount || 0);

  // P&L
  if (e.creditAccount === "revenue") acc.revenue += a;
  if (e.debitAccount === "cogs") acc.cogs += a;
  if (e.debitAccount === "expenses") acc.expenses += a;

  // Cash
  if (e.debitAccount === "cash") acc.cashIn += a;
  if (e.creditAccount === "cash") acc.cashOut += a;

  acc.count += 1;
}

function finalize(acc) {
  const gross = acc.revenue - acc.cogs;
  const net = gross - acc.expenses;
  const netCash = acc.cashIn - acc.cashOut;

  return {
    ...acc,
    grossProfit: gross,
    netProfit: net,
    netCash
  };
}

// --------- GROUP KEY ---------

function groupKeyOf(e, groupBy) {
  if (!groupBy || groupBy === "none") return "all";

  if (groupBy === "type") return e.type || "unknown";
  if (groupBy === "customer") return e.customerId || "no_customer";
  if (groupBy === "product") {
    // إن لم يكن لديك productId في ledger لكل entry
    // سيبقى "unknown" — لاحقًا تربطه
    return e.productId || "unknown_product";
  }

  return "all";
}

// --------- ENGINE ---------

export function buildReport(entries = [], options = {}) {
  const {
    from = null,
    to = null,
    period = "day",      // day | week | month
    groupBy = "none"     // none | type | customer | product
  } = options;

  // 1) FILTER
  const data = entries.filter(e => inRange(e.createdAt, from, to));

  // 2) GLOBAL AGG
  const global = aggBase();

  // 3) TIMELINE (by period)
  const timeline = new Map(); // key -> acc

  // 4) GROUPS
  const groups = new Map();   // key -> acc

  // 5) DRILL INDEX
  // groupKey -> entries[]
  const groupEntries = new Map();

  for (const e of data) {
    // ---- global
    applyEntry(global, e);

    // ---- timeline
    const tKey = bucketKey(e.createdAt, period);
    if (!timeline.has(tKey)) timeline.set(tKey, aggBase());
    applyEntry(timeline.get(tKey), e);

    // ---- groups
    const gKey = groupKeyOf(e, groupBy);
    if (!groups.has(gKey)) groups.set(gKey, aggBase());
    applyEntry(groups.get(gKey), e);

    // ---- drill index
    if (!groupEntries.has(gKey)) groupEntries.set(gKey, []);
    groupEntries.get(gKey).push(e);
  }

  // finalize
  const globalF = finalize(global);

  const timelineArr = Array.from(timeline.entries())
    .map(([k, v]) => ({
      key: k,
      label: new Date(Number(k)).toLocaleDateString(),
      ...finalize(v)
    }))
    .sort((a, b) => a.key - b.key);

  const groupsArr = Array.from(groups.entries())
    .map(([k, v]) => ({
      key: k,
      ...finalize(v)
    }))
    .sort((a, b) => b.netProfit - a.netProfit);

  return {
    filters: { from, to, period, groupBy },
    global: globalF,
    timeline: timelineArr,
    groups: groupsArr,
    // للـ drilldown
    _groupEntries: groupEntries,
    _all: data
  };
}

// --------- DRILLDOWN HELPERS ---------

export function drillGroup(report, groupKey) {
  const list = report._groupEntries.get(groupKey) || [];
  // تجميع حسب operationId لعرض حدث كامل
  const map = {};
  for (const e of list) {
    const k = e.operationId || e.sourceId || e.id;
    if (!map[k]) {
      map[k] = {
        operationId: k,
        createdAt: e.createdAt,
        entries: []
      };
    }
    map[k].entries.push(e);
  }
  return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
}

export function drillOperation(report, operationId) {
  return report._all
    .filter(e => (e.operationId || e.sourceId) === operationId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
