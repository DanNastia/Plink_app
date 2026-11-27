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
    dailyLimitKop: days === 0 ? null : Math.floor(Math.max(0, freeKop) / days),
  }
}

// paidAmountKop — сумма фактически проведённых оплат этого обязательства.
function remainingKop({ amountKop, paidAmountKop, paidTransactionId }) {
  positiveKop(amountKop)
  if (paidAmountKop === undefined) return paidTransactionId === null ? amountKop : 0
  if (safeKop(paidAmountKop) < 0 || paidAmountKop > amountKop) {
    throw new RangeError('Оплаченная часть должна быть в пределах суммы обязательства.')
  }
  return amountKop - paidAmountKop
}

function includedInReserve(obligation, end) {
  const due = calendarDay(obligation.dueDate)
  return due < end || (due === end && obligation.dueBeforeIncome === true)
}

// balanceKop — результат calculateBalanceKop(transactions) из finance.js.
export function calculateBudget({ balanceKop, obligations, today, nextIncomeDate }) {
  safeKop(balanceKop)
  const start = calendarDay(today)
  if (nextIncomeDate == null) return { status: 'unavailable' }
  const end = calendarDay(nextIncomeDate)
  const days = end - start
  if (days < 0) return { status: 'unavailable' }

  let reserveKop = 0
  for (const obligation of obligations) {
    if (includedInReserve(obligation, end)) {
      reserveKop = safeKop(reserveKop + remainingKop(obligation))
    }
  }
  return {
    status: days === 0 ? 'incomeDueToday' : 'available',
    days,
    reserveKop,
    ...spendingLimit(balanceKop - reserveKop, days),
  }
}

// purchaseKop — цена в копейках, например результат parseAmountKop(input).
// Для примерки оплаты плана передайте его id третьим аргументом.
export function forecastPurchase(input, purchaseKop, obligationId) {
  const before = calculateBudget(input)
  if (before.status !== 'available') return before
  const balanceAfterKop = safeKop(input.balanceKop - positiveKop(purchaseKop))
  let reserveKop = before.reserveKop
  if (obligationId !== undefined) {
    const plan = input.obligations.find(obligation => obligation.id === obligationId)
    if (!plan || purchaseKop > remainingKop(plan)) {
      throw new RangeError('Для оплаты нужен план с достаточным неоплаченным остатком.')
    }
    if (includedInReserve(plan, calendarDay(input.nextIncomeDate))) reserveKop -= purchaseKop
  }
  const after = {
    ...before,
    reserveKop,
    ...spendingLimit(balanceAfterKop - reserveKop, before.days),
  }
  return { status: 'available', before, after }
}
