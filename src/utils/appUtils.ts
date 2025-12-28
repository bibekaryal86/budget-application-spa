export const getNumber = (value: number | string | null | undefined): number =>
  value ? (isNaN(Number(value)) ? 0 : Number(value)) : 0

export const checkNumber = (value: number | string | null | undefined): boolean => getNumber(value) > 0

export const getString = (value: string | number | null | undefined): string => (value ? value.toString().trim() : '')

export const getFormattedDate = (value: Date | null): string => {
  if (value === null) return '-'
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
