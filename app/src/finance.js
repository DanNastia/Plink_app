// Возвращает целые копейки. Неверный формат вызывает TypeError,
// ноль и выход за диапазон безопасных целых — RangeError.
export function parseAmountKop(input) {
  const match = typeof input === 'string' && /^(\d+)(?:[.,](\d{1,2}))?$/.exec(input)
  if (!match) {
    throw new TypeError('Введите сумму цифрами, с точностью до двух знаков после разделителя.')
  }

  const [, rubles, fraction = ''] = match
  const amountKop = Number(rubles) * 100 + Number(fraction.padEnd(2, '0'))
  if (amountKop === 0 || !Number.isSafeInteger(amountKop)) {
    throw new RangeError('Сумма должна быть положительной и укладываться в безопасный диапазон копеек.')
  }
  return amountKop
}

function sumByType(transactions, type) {
  let total = 0
  for (const transaction of transactions) {
    if (transaction.type !== 'income' && transaction.type !== 'expense') {
      throw new TypeError('Неизвестный тип операции.')
    }
    if (transaction.type !== type) continue

    const { amountKop } = transaction
    if (!Number.isSafeInteger(amountKop) || amountKop <= 0) {
      throw new RangeError('Сумма операции должна быть положительным безопасным целым в копейках.')
    }
    total += amountKop
    if (!Number.isSafeInteger(total)) {
      throw new RangeError('Денежный итог превышает диапазон безопасных целых.')
    }
  }
  return total
}

export function sumIncomeKop(transactions) {
  return sumByType(transactions, 'income')
}

export function sumExpenseKop(transactions) {
  return sumByType(transactions, 'expense')
}

export function calculateBalanceKop(transactions) {
  return sumIncomeKop(transactions) - sumExpenseKop(transactions)
}
