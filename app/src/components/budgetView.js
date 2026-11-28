import { sumExpenseKop } from '../finance.js'

const calendarFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeZone: 'UTC' })
const monthFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export function localDate(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function displayDate(date) {
  return calendarFormat.format(new Date(date + 'T00:00:00Z'))
}

export function currentMonth(today) {
  return monthFormat.format(new Date(today + 'T00:00:00Z'))
}

export function expenseRows(transactions, categories, today) {
  const month = today.slice(0, 7)
  const expenses = transactions.filter(entry => entry.type === 'expense' && entry.date.startsWith(month))
  const total = sumExpenseKop(expenses)
  if (!total) return []

  return categories.flatMap(([id, title]) => {
    const amountKop = sumExpenseKop(expenses.filter(entry => entry.categoryId === id))
    return amountKop ? [{ title, amountKop, percent: amountKop / total * 100 }] : []
  })
}
