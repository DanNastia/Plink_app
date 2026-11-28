import { useEffect, useRef, useState } from 'react'
import { calculateBalanceKop, parseAmountKop } from './finance.js'
import { calculateBudget, forecastPurchase } from './budget-rules.js'
import { loadState, saveState } from './storage.js'
import { currentMonth, displayDate, expenseRows, localDate } from './components/budgetView.js'
import BudgetSummary from './components/BudgetSummary'
import TransactionForm from './components/TransactionForm'
import Obligations from './components/Obligations'
import PurchaseForecast from './components/PurchaseForecast'
import ExpenseChart from './components/ExpenseChart'
import TransactionList from './components/TransactionList'
import './App.css'

const categories = {
  income: [['stipend', 'Стипендия'], ['opening', 'Начальный остаток']],
  expense: [['food', 'Продукты'], ['home', 'ЖКХ'], ['transport', 'Транспорт']],
}

function readInitialState() {
  try {
    return { state: loadState(categories), readError: null }
  } catch (error) {
    return { state: null, readError: error.message }
  }
}

function budgetInput(state, today) {
  return {
    balanceKop: calculateBalanceKop(state.transactions),
    obligations: state.obligations,
    nextIncomeDate: state.nextIncomeDate,
    today,
  }
}

function useToday() {
  const [today, setToday] = useState(localDate)
  useEffect(() => {
    let timer
    function refresh() {
      const now = new Date()
      setToday(localDate(now))
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      clearTimeout(timer)
      timer = setTimeout(refresh, midnight - now)
    }
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return today
}

export default function App() {
  const [{ state, readError }, setSession] = useState(readInitialState)
  const saved = useRef(state)
  const today = useToday()

  function commit(change) {
    try {
      const actionDate = localDate()
      const next = change(saved.current, actionDate)
      calculateBudget(budgetInput(next, actionDate))
      saveState(next, categories)
      saved.current = next
      setSession({ state: next, readError: null })
      return null
    } catch (error) {
      return error.message
    }
  }

  function addTransaction({ rawAmount, ...fields }) {
    return commit((previous, actionDate) => {
      if (fields.date > actionDate) throw new RangeError('Дата операции не может быть в будущем.')
      const entry = { ...fields, id: crypto.randomUUID(), amountKop: parseAmountKop(rawAmount) }
      return { ...previous, transactions: [...previous.transactions, entry] }
    })
  }

  function addObligation({ rawAmount, ...fields }) {
    return commit(previous => {
      const plan = { ...fields, id: crypto.randomUUID(), amountKop: parseAmountKop(rawAmount), paidTransactionId: null }
      return { ...previous, obligations: [...previous.obligations, plan] }
    })
  }

  function changeObligation(id, pay) {
    return commit((previous, actionDate) => {
      const plan = previous.obligations.find(item => item.id === id)
      if (!plan || plan.paidTransactionId !== null) throw new Error('Этот платёж уже обработан.')
      if (!pay) return { ...previous, obligations: previous.obligations.filter(item => item.id !== id) }

      const entry = {
        id: crypto.randomUUID(),
        type: 'expense',
        date: actionDate,
        amountKop: plan.amountKop,
        categoryId: plan.categoryId,
        comment: plan.title,
      }
      return {
        ...previous,
        transactions: [...previous.transactions, entry],
        obligations: previous.obligations.map(item => item.id === id
          ? { ...item, paidTransactionId: entry.id }
          : item),
      }
    })
  }

  function saveDate(date) {
    return commit((previous, actionDate) => {
      if (date <= actionDate) throw new RangeError('Выберите будущую дату поступления.')
      return { ...previous, nextIncomeDate: date }
    })
  }

  let content
  if (readError) {
    content = <p role="alert">Не удалось прочитать сохранённые данные. {readError}</p>
  } else {
    const input = budgetInput(state, today)
    let budget
    let budgetError
    try {
      budget = calculateBudget(input)
    } catch (error) {
      budgetError = error.message
    }
    const available = budget?.status === 'available'
    content = <>
      <BudgetSummary budget={budget} budgetError={budgetError} balanceKop={input.balanceKop}
        nextIncomeDate={state.nextIncomeDate} onSaveDate={saveDate} />
      <div className="grid">
        <TransactionForm onAddTransaction={addTransaction} categories={categories} today={today} />
        <Obligations plans={state.obligations} categories={categories.expense} today={today}
          nextIncomeDate={available ? state.nextIncomeDate : null} onAdd={addObligation}
          onPay={id => changeObligation(id, true)} onCancel={id => changeObligation(id, false)} />
        <PurchaseForecast available={available}
          onForecast={price => forecastPurchase(input, parseAmountKop(price))} />
        <ExpenseChart rows={expenseRows(state.transactions, categories.expense, today)} month={currentMonth(today)} />
      </div>
      <TransactionList entries={state.transactions} categories={categories} />
    </>
  }

  return <main lang="ru">
    <header><span className="brand">plink<span>.</span></span><span>{displayDate(today)}</span></header>
    <h1>Мой бюджет</h1>
    {content}
  </main>
}
