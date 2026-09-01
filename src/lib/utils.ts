export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPKRWithSymbol(amount: number): string {
  return `Rs ${formatPKR(amount)}`
}

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n: number): string {
  if (n < 10) return ones[n]
  if (n < 20) return teens[n - 10]
  return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  let s = ''
  if (h > 0) s += ones[h] + ' Hundred'
  if (r > 0) s += (h > 0 ? ' ' : '') + twoDigits(r)
  return s
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = num % 1000
  let s = ''
  if (crore > 0) s += twoDigits(crore) + ' Crore '
  if (lakh > 0) s += twoDigits(lakh) + ' Lakh '
  if (thousand > 0) s += twoDigits(thousand) + ' Thousand '
  if (hundred > 0) s += threeDigits(hundred)
  return s.trim() + ' Rupees Only'
}

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const TOKEN_KEY = 'sk_token'
export const USER_KEY = 'sk_user'

export function getApiError(error: unknown, fallback = 'Something went wrong'): string {
  if (error && typeof error === 'object') {
    const e = error as { data?: { error?: string; title?: string }; error?: string; status?: number }
    if (e.data?.error) return e.data.error
    if (e.data?.title) return e.data.title
    if (typeof e.error === 'string') return e.error
  }
  return fallback
}
