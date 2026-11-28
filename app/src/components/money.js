const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 })

export function money(kopecks) {
  const digits = String(Math.abs(kopecks)).padStart(3, '0')
  const rubles = digits.slice(0, -2)
  const fraction = digits.slice(-2)
  return currency.format((kopecks < 0 ? '-' : '') + rubles + '.' + fraction)
}
