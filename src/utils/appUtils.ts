import type { Transaction, TransactionItem } from '@types'
import { format } from 'date-fns'

export const getNumber = (value: number | string | null | undefined): number =>
  value ? (isNaN(Number(value)) ? 0 : Number(value)) : 0

export const checkNumber = (value: number | string | null | undefined): boolean => getNumber(value) > 0

export const getString = (value: string | number | null | undefined): string => (value ? value.toString().trim() : '')

export const getFormattedDate = (value: Date | null): string => {
  if (value === null) return '-'
  return format(new Date(value), 'yyyy-MM-dd')
}

export const getFormattedCurrency = (amount: number | null, currency: string = 'USD'): string => {
  if (amount == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const getFormattedPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export const getAmountColor = (amount: number | null): string => {
  if (amount == null) return ''
  return amount < 0 ? 'error.main' : 'success.main'
}

export const getTxnAmountColor = (txn: Transaction | null): string => {
  if (txn == null || txn.items.length === 0) return ''
  return getTxnItemAmountColor(txn.items[0])
}

export const getTxnItemAmountColor = (item: TransactionItem): string => {
  if (item == null) return ''
  const catTypeName = item.category.categoryType.name
  if (catTypeName === 'TRANSFER') return ''
  if (catTypeName === 'INCOME') return 'success.main'
  if (catTypeName === 'SAVINGS') return 'warning.main'
  return 'error.main'
}
