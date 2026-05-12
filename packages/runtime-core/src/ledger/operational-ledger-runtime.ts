export interface LedgerEntry {
  id: string
  debit: number
  credit: number
  account: string
  timestamp: number
}

export class OperationalLedgerRuntime {
  private ledger: LedgerEntry[] = []

  execute(entry: LedgerEntry) {
    this.ledger.push(entry)

    return {
      balanced: entry.debit === entry.credit,
      entry,
    }
  }

  audit() {
    return this.ledger
  }

  balance() {
    return this.ledger.reduce(
      (accumulator, entry) => {
        accumulator.debit += entry.debit
        accumulator.credit += entry.credit

        return accumulator
      },
      {
        debit: 0,
        credit: 0,
      },
    )
  }
}

export const operationalLedgerRuntime =
  new OperationalLedgerRuntime()
