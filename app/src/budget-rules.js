const DAY_MS = 86_400_000

function calendarDay(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new TypeError('Ожидается дата в формате YYYY-MM-DD.')
  }
  const midnight = Date.parse(date + 'T00:00:00Z')
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== date) {
    throw new RangeError('Такой календарной даты не существует.')
  }
  return midnight / DAY_MS
}

function safeKop(value) {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError('Денежный итог должен быть безопасным целым в копейках.')
  }
  return value
}

function positiveKop(value) {
  if (safeKop(value) <= 0) {
    throw new RangeError('Сумма должна быть положительной.')
  }
  return value
}

function spendingLimit(freeKop, days) {
  safeKop(freeKop)
  return {
    freeKop,
    deficitKop: Math.max(0, -freeKop),
    dailyLimitKop: Math.floor(Math.max(0, freeKop) / days),
  }
}

// balanceKop — результат calculateBalanceKop(transactions) из finance.js.
export function calculateBudget({ balanceKop, obligations, today, nextIncomeDate }) {
  safeKop(balanceKop)
  const start = calendarDay(today)
  if (nextIncomeDate == null) return { status: 'unavailable' }
  const end = calendarDay(nextIncomeDate)
  const days = end - start
  if (days <= 0) return { status: 'unavailable' }

  let reserveKop = 0
  for (const { paidTransactionId, dueDate, amountKop } of obligations) {
    if (paidTransactionId === null && calendarDay(dueDate) < end) {
      reserveKop = safeKop(reserveKop + positiveKop(amountKop))
    }
  }
  return {
    status: 'available',
    days,
    reserveKop,
    ...spendingLimit(balanceKop - reserveKop, days),
  }
}

// purchaseKop — цена в копейках, например результат parseAmountKop(input).
export function forecastPurchase(input, purchaseKop) {
  const before = calculateBudget(input)
  if (before.status === 'unavailable') return before
  const after = {
    ...before,
    ...spendingLimit(before.freeKop - positiveKop(purchaseKop), before.days),
  }
  return { status: 'available', before, after }
}
