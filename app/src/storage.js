import { calculateBalanceKop } from './finance.js'

const STORAGE_KEY = 'plink.v1'

export function createInitialState() {
  return { transactions: [], obligations: [], nextIncomeDate: null }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateDate(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${field} должна иметь формат YYYY-MM-DD.`)
  }
  const midnight = Date.parse(value + 'T00:00:00Z')
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== value) {
    throw new RangeError(`${field} не существует в календаре.`)
  }
}

function checkId(id, seenIds, kind) {
  if (!isNonEmptyString(id)) throw new TypeError(`У ${kind} отсутствует идентификатор.`)
  if (seenIds.has(id)) throw new TypeError(`Повторяется идентификатор ${kind}: ${id}.`)
}

export function validateState(state, categories) {
  if (!isObject(state) || !Array.isArray(state.transactions) || !Array.isArray(state.obligations)) {
    throw new TypeError('Ожидается объект со списками операций и обязательств.')
  }
  if (!Array.isArray(categories?.income) || !Array.isArray(categories?.expense)) {
    throw new TypeError('Передайте справочник категорий доходов и расходов.')
  }
  const incomeCategories = new Set(categories.income.map(([id]) => id))
  const expenseCategories = new Set(categories.expense.map(([id]) => id))
  if (state.nextIncomeDate !== null) validateDate(state.nextIncomeDate, 'Дата поступления')

  const transactionsById = new Map()
  for (const transaction of state.transactions) {
    if (!isObject(transaction)) throw new TypeError('Операция должна быть объектом.')
    const { id, type, date, categoryId, comment } = transaction
    checkId(id, transactionsById, 'операции')
    if (type !== 'income' && type !== 'expense') throw new TypeError('Неизвестный тип операции.')
    const allowedCategories = type === 'income' ? incomeCategories : expenseCategories
    if (!isNonEmptyString(categoryId) || !allowedCategories.has(categoryId)) {
      throw new TypeError(`Недопустимая категория операции ${id}.`)
    }
    if (typeof comment !== 'string') throw new TypeError(`Комментарий операции ${id} должен быть строкой.`)
    validateDate(date, 'Дата операции')
    transactionsById.set(id, transaction)
  }
  // Финансовый модуль проверяет суммы каждой операции и переполнение итогов.
  calculateBalanceKop(state.transactions)

  const obligationIds = new Set()
  const usedPayments = new Set()
  for (const obligation of state.obligations) {
    if (!isObject(obligation)) throw new TypeError('Обязательство должно быть объектом.')
    const { id, title, categoryId, dueDate, amountKop, paidTransactionId } = obligation
    checkId(id, obligationIds, 'обязательства')
    obligationIds.add(id)
    if (!isNonEmptyString(title)) throw new TypeError(`У обязательства ${id} отсутствует название.`)
    if (!isNonEmptyString(categoryId) || !expenseCategories.has(categoryId)) {
      throw new TypeError(`Недопустимая категория обязательства ${id}.`)
    }
    if (!Number.isSafeInteger(amountKop) || amountKop <= 0) {
      throw new RangeError(`Сумма обязательства ${id} должна быть положительным безопасным целым в копейках.`)
    }
    validateDate(dueDate, 'Дата оплаты')
    if (paidTransactionId === null) continue

    const payment = transactionsById.get(paidTransactionId)
    if (payment?.type !== 'expense' || payment.amountKop !== amountKop || payment.categoryId !== categoryId) {
      throw new TypeError(`Оплата обязательства ${id} должна ссылаться на расход с той же суммой и категорией.`)
    }
    if (usedPayments.has(paidTransactionId)) {
      throw new TypeError(`Операция ${paidTransactionId} уже связана с другим обязательством.`)
    }
    usedPayments.add(paidTransactionId)
  }
}

function storageError(code, message, cause) {
  return Object.assign(new Error(`${message} ${cause?.message ?? String(cause)}`, { cause }), { code })
}

function readExisting(categories, storage) {
  let raw
  try {
    storage ??= globalThis.localStorage
    raw = storage.getItem(STORAGE_KEY)
  } catch (cause) {
    throw storageError('read_failed', 'Не удалось прочитать данные Plink.', cause)
  }
  if (raw === null) return { storage, state: createInitialState() }

  try {
    const state = JSON.parse(raw)
    validateState(state, categories)
    return { storage, state }
  } catch (cause) {
    throw storageError('invalid_saved_state', 'Сохранение Plink повреждено.', cause)
  }
}

export function loadState(categories, storage) {
  return readExisting(categories, storage).state
}

export function saveState(state, categories, storage) {
  // Проверяем текущую запись перед каждой попыткой, включая запись без предыдущего loadState.
  const existing = readExisting(categories, storage)
  validateState(state, categories)
  try {
    const serialized = JSON.stringify(state)
    // Проверяем JSON, который действительно попадёт в хранилище, в том числе после toJSON.
    validateState(JSON.parse(serialized), categories)
    existing.storage.setItem(STORAGE_KEY, serialized)
  } catch (cause) {
    throw storageError('write_failed', 'Не удалось сохранить данные Plink.', cause)
  }
}
