const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 })
export function money(kopecks) {
  return currency.format(kopecks / 100)
}
