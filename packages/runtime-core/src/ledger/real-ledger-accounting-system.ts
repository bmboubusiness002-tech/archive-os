export interface JournalEntry {
  id: string
  account: string
  debit: number
  credit: number
  timestamp: number
}

export class RealLedgerAccountingSystem {
  private journals: JournalEntry[] = []

  record(entry: JournalEntry) {
    this.journals.push(entry)

    return {
      balanced: entry.debit === entry.credit,
      entry,
    }
  }

  balances() {
    return this.journals.reduce(
      (accumulator, journal) => {
        accumulator.debit += journal.debit
        accumulator.credit += journal.credit

        return accumulator
      },
      {
        debit: 0,
        credit: 0,
      },
    )
  }

  cashflow() {
    return this.journals.map((journal) => ({
      account: journal.account,
      net: journal.debit - journal.credit,
    }))
  }

  profitAndLoss() {
    return {
      revenue: 0,
      expenses: 0,
      profit: 0,
    }
  }

  auditChains() {
    return this.journals
  }
}

export const realLedgerAccountingSystem =
  new RealLedgerAccountingSystem()
