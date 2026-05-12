// -------------------------------------
// CHART OF ACCOUNTS (COA)
// -------------------------------------

export const ACCOUNT_TYPES = {
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  EQUITY: "EQUITY",
  REVENUE: "REVENUE",
  EXPENSE: "EXPENSE"
};

// -------------------------------------

export const ACCOUNTS = {
  CASH: "cash",
  BANK: "bank",

  ACCOUNTS_RECEIVABLE: "accounts_receivable",

  INVENTORY: "inventory",

  ACCOUNTS_PAYABLE: "accounts_payable",

  REVENUE: "revenue",
  COGS: "cogs",
  EXPENSES: "expenses",

  EQUITY: "equity"
};

// -------------------------------------

export const COA = {
  [ACCOUNTS.CASH]: { type: ACCOUNT_TYPES.ASSET },
  [ACCOUNTS.BANK]: { type: ACCOUNT_TYPES.ASSET },

  [ACCOUNTS.ACCOUNTS_RECEIVABLE]: { type: ACCOUNT_TYPES.ASSET },

  [ACCOUNTS.INVENTORY]: { type: ACCOUNT_TYPES.ASSET },

  [ACCOUNTS.ACCOUNTS_PAYABLE]: { type: ACCOUNT_TYPES.LIABILITY },

  [ACCOUNTS.REVENUE]: { type: ACCOUNT_TYPES.REVENUE },

  [ACCOUNTS.COGS]: { type: ACCOUNT_TYPES.EXPENSE },
  [ACCOUNTS.EXPENSES]: { type: ACCOUNT_TYPES.EXPENSE },

  [ACCOUNTS.EQUITY]: { type: ACCOUNT_TYPES.EQUITY }
};
