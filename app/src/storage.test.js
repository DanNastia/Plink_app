import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createInitialState, loadState, saveState, validateState } from './storage.js'

const key = 'plink.v1'
const categories = { income: [['stipend', 'Стипендия']], expense: [['food', 'Продукты'], ['home', 'ЖКХ']] }
const income = { id: 't1', type: 'income', amountKop: 100000, date: '2026-11-28', categoryId: 'stipend', comment: '' }
const expense = { id: 't2', type: 'expense', amountKop: 30000, date: '2026-11-28', categoryId: 'home', comment: 'Ноябрь' }
const plan = { id: 'p1', title: 'ЖКХ', amountKop: 30000, categoryId: 'home', dueDate: '2026-12-01', paidTransactionId: null }

function memoryStorage(raw = null) {
  return {
    raw,
    writes: [],
    readError: null,
    writeError: null,
    getItem(name) {
      assert.equal(name, key)
      if (this.readError) throw this.readError
      return this.raw
    },
    setItem(name, value) {
      assert.equal(name, key)
      if (this.writeError) throw this.writeError
      this.writes.push({ name, value })
      this.raw = value
    },
  }
}

function state(overrides = {}) {
  return { transactions: [income, expense], obligations: [plan], nextIncomeDate: '2026-12-03', ...overrides }
}

test('первый запуск возвращает пустое состояние и не записывает его', () => {
  const storage = memoryStorage()
  assert.deepEqual(loadState(categories, storage), { transactions: [], obligations: [], nextIncomeDate: null })
  assert.equal(storage.raw, null)
  assert.equal(storage.writes.length, 0)
})

test('пустые состояния имеют независимые массивы', () => {
  const first = createInitialState()
  first.transactions.push(income)
  first.obligations.push(plan)
  assert.deepEqual(createInitialState(), { transactions: [], obligations: [], nextIncomeDate: null })
})

test('одна запись восстанавливает доход, расход, план и дату полностью', () => {
  const storage = memoryStorage()
  const original = state()
  assert.equal(validateState(original, categories), undefined)
  assert.equal(saveState(original, categories, storage), undefined)
  assert.deepEqual(storage.writes, [{ name: key, value: JSON.stringify(original) }])
  assert.deepEqual(loadState(categories, memoryStorage(storage.raw)), original)
})

test('прошедшая дата поступления сохраняется при загрузке', () => {
  const previous = state({ nextIncomeDate: '2025-12-03' })
  assert.deepEqual(loadState(categories, memoryStorage(JSON.stringify(previous))), previous)
})

test('повреждённый JSON сообщает об ошибке и сохраняет исходную строку', () => {
  const storage = memoryStorage('{сломано')
  assert.throws(() => loadState(categories, storage), error => error.code === 'invalid_saved_state' && error.cause instanceof SyntaxError)
  assert.equal(storage.raw, '{сломано')
  assert.equal(storage.writes.length, 0)
})

test('некорректная структура отклоняется при загрузке и сохранении', () => {
  const invalidStates = [
    null, [], {}, state({ obligations: {} }), state({ nextIncomeDate: undefined }),
    state({ transactions: [null] }), state({ obligations: [null] }),
    state({ transactions: [{ ...income, comment: null }] }), state({ obligations: [{ ...plan, title: ' ' }] }),
  ]
  for (const invalid of invalidStates) {
    assert.throws(() => loadState(categories, memoryStorage(JSON.stringify(invalid))), { code: 'invalid_saved_state' })
    const target = memoryStorage()
    assert.throws(() => saveState(invalid, categories, target), TypeError)
    assert.equal(target.writes.length, 0)
  }
})

test('суммы операций и обязательств должны быть положительными безопасными целыми', () => {
  for (const amountKop of [-1, 0, 0.5, Number.MAX_SAFE_INTEGER + 1, '100']) {
    assert.throws(() => validateState(state({ transactions: [{ ...income, amountKop }] }), categories), RangeError)
    assert.throws(() => validateState(state({ obligations: [{ ...plan, amountKop }] }), categories), RangeError)
  }
  const transactions = [{ ...income, amountKop: Number.MAX_SAFE_INTEGER }, { ...income, id: 't3' }]
  assert.throws(() => validateState(state({ transactions }), categories), RangeError)
})

test('проверяет формат и существование всех календарных дат', () => {
  for (const invalid of [
    state({ nextIncomeDate: '2026-02-30' }),
    state({ transactions: [{ ...income, date: '2026-02-29' }] }),
    state({ obligations: [{ ...plan, dueDate: '2026-04-31' }] }),
  ]) {
    assert.throws(() => validateState(invalid, categories), RangeError)
  }
  assert.throws(() => validateState(state({ nextIncomeDate: '01.12.2026' }), categories), TypeError)
  assert.doesNotThrow(() => validateState(state({ nextIncomeDate: '2028-02-29' }), categories))
})

test('отклоняет неизвестный тип и категории, включая категорию другого типа', () => {
  for (const invalid of [
    state({ transactions: [{ ...income, type: 'transfer' }] }),
    state({ transactions: [{ ...income, categoryId: 'unknown' }] }),
    state({ transactions: [{ ...income, categoryId: 'food' }] }),
    state({ transactions: [{ ...expense, categoryId: 'stipend' }] }),
    state({ obligations: [{ ...plan, categoryId: 'stipend' }] }),
  ]) {
    assert.throws(() => validateState(invalid, categories), TypeError)
  }
})

test('отклоняет пустые и повторяющиеся идентификаторы', () => {
  for (const invalid of [
    state({ transactions: [{ ...income, id: ' ' }] }),
    state({ obligations: [{ ...plan, id: '' }] }),
    state({ transactions: [income, { ...expense, id: income.id }] }),
    state({ obligations: [plan, { ...plan }] }),
  ]) {
    assert.throws(() => validateState(invalid, categories), TypeError)
  }
})

test('оплата требует существующий расход с той же суммой и категорией', () => {
  for (const changedPlan of [
    { ...plan, paidTransactionId: 'missing' },
    { ...plan, paidTransactionId: income.id, amountKop: income.amountKop },
    { ...plan, paidTransactionId: expense.id, amountKop: 1 },
    { ...plan, paidTransactionId: expense.id, categoryId: 'food' },
    { ...plan, paidTransactionId: undefined },
  ]) {
    assert.throws(() => validateState(state({ obligations: [changedPlan] }), categories), TypeError)
  }
})

test('расход может подтверждать оплату только одного обязательства', () => {
  const paid = { ...plan, paidTransactionId: expense.id }
  assert.throws(() => validateState(state({ obligations: [paid, { ...paid, id: 'p2' }] }), categories), TypeError)
})

test('ошибка чтения блокирует и загрузку, и попытку записи', () => {
  const raw = JSON.stringify(state())
  const storage = memoryStorage(raw)
  storage.readError = new Error('Хранилище заблокировано')
  assert.throws(() => loadState(categories, storage), { code: 'read_failed', cause: storage.readError })
  assert.throws(() => saveState(createInitialState(), categories, storage), { code: 'read_failed' })
  assert.equal(storage.raw, raw)
  assert.equal(storage.writes.length, 0)
})

test('ошибка записи сохраняет прежние данные и позволяет повторить попытку', () => {
  const original = state()
  const storage = memoryStorage(JSON.stringify(original))
  const next = state({ nextIncomeDate: null })
  storage.writeError = new Error('QuotaExceededError')
  assert.throws(() => saveState(next, categories, storage), { code: 'write_failed', cause: storage.writeError })
  assert.deepEqual(loadState(categories, storage), original)
  assert.equal(storage.writes.length, 0)
  storage.writeError = null
  saveState(next, categories, storage)
  assert.deepEqual(loadState(categories, storage), next)
})

test('повреждённую запись нельзя перезаписать даже без предварительной загрузки', () => {
  for (const raw of ['{bad', '{"transactions":[]}', JSON.stringify(state({ obligations: [{ ...plan, paidTransactionId: 'missing' }] }))]) {
    const storage = memoryStorage(raw)
    assert.throws(() => saveState(createInitialState(), categories, storage), { code: 'invalid_saved_state' })
    assert.equal(storage.raw, raw)
    assert.equal(storage.writes.length, 0)
  }
})

test('после успешной загрузки запись блокируется, если сохранение успело повредиться', () => {
  const storage = memoryStorage(JSON.stringify(state()))
  const original = loadState(categories, storage)
  storage.raw = 'broken'
  assert.throws(() => saveState(original, categories, storage), { code: 'invalid_saved_state' })
  assert.equal(storage.raw, 'broken')
  assert.equal(storage.writes.length, 0)
})

test('расход и ссылка на оплату сохраняются вместе, одним вызовом setItem', () => {
  const original = state({ transactions: [income] })
  const storage = memoryStorage(JSON.stringify(original))
  const paid = state({ obligations: [{ ...plan, paidTransactionId: expense.id }] })
  storage.writeError = new Error('Нет места')
  assert.throws(() => saveState(paid, categories, storage), { code: 'write_failed' })
  assert.deepEqual(loadState(categories, storage), original)

  storage.writeError = null
  saveState(paid, categories, storage)
  assert.equal(storage.writes.length, 1)
  assert.deepEqual(loadState(categories, memoryStorage(storage.writes[0].value)), paid)
})

test('ошибка сериализации или невалидный результат toJSON не заменяет сохранение', () => {
  const raw = JSON.stringify(state())
  const storage = memoryStorage(raw)
  const circular = state()
  circular.extra = circular

  for (const next of [circular, { ...state(), toJSON: () => ({}) }]) {
    assert.throws(() => saveState(next, categories, storage), { code: 'write_failed' })
    assert.equal(storage.raw, raw)
    assert.equal(storage.writes.length, 0)
  }
})
