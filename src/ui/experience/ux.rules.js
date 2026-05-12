// -------------------------------------
// UX RULES (DECISION ENGINE)
// -------------------------------------

export function decideUX({ signals = [] }) {
  const ui = {
    highlight: null,
    show: [],
    hide: [],
    focus: null,
    mode: "normal"
  };

  for (const s of signals) {
    // -------------------------------------
    if (s.type === "cash_negative") {
      ui.highlight = "cash";
      ui.mode = "alert";
      ui.show.push("cash_panel");
    }

    // -------------------------------------
    if (s.type === "low_margin") {
      ui.show.push("margin_warning");
    }

    // -------------------------------------
    if (s.type === "pos_loss") {
      ui.mode = "danger";
      ui.focus = "profit";
    }

    // -------------------------------------
    if (s.type === "pos_low_margin") {
      ui.show.push("profit_hint");
    }

    // -------------------------------------
    if (s.type === "no_sales") {
      ui.show.push("sales_hint");
    }
  }

  return ui;
}
