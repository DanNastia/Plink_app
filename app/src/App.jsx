import { useState } from 'react'
import BudgetSummary from './components/BudgetSummary'
import TransactionForm from './components/TransactionForm'
import Obligations from './components/Obligations'
import PurchaseForecast from './components/PurchaseForecast'
import ExpenseChart from './components/ExpenseChart'
import TransactionList from './components/TransactionList'
import './App.css'

const categories = { income: ['Стипендия', 'Начальный остаток'], expense: ['Продукты', 'ЖКХ', 'Транспорт'] }
const initialEntries = [
  { id: 't2', title: 'Продукты', income: false, amountKop: 10000 },
  { id: 't1', title: 'Стипендия', income: true, amountKop: 100000 },
]
const food = { title: 'Продукты', amountKop: 10000, percent: 100 }
const plan = { title: 'ЖКХ', amountKop: 30000, due: '12 мая' }
// Готовые снимки сценария A-04. Итоги позднее предоставит финансовый модуль.
const snapshots = {
  pending: { balance: 90000, reserve: 30000, free: 60000, limit: 20000, after: 15000 },
  paid: { balance: 60000, reserve: 0, free: 60000, limit: 20000, after: 15000 },
  cancelled: { balance: 90000, reserve: 0, free: 90000, limit: 30000, after: 25000 },
}

export default function App() {
  const [status, setStatus] = useState('pending')
  const budget = snapshots[status]
  const paid = status === 'paid'
  const entries = paid ? [{ id: 't3', title: 'ЖКХ', income: false, amountKop: 30000 }, ...initialEntries] : initialEntries
  const rows = paid ? [{ title: 'ЖКХ', amountKop: 30000, percent: 75 }, { ...food, percent: 25 }] : [food]
  return (
    <main lang="ru">
      <header><span className="brand">plink<span>.</span></span><span>Деморежим · 10 мая 2026</span></header>
      <h1>Мой бюджет</h1>
      <BudgetSummary budget={budget} nextIncomeDate="2026-05-13" days={3} />
      <div className="grid">
        <TransactionForm categories={categories} today="2026-05-10" />
        <Obligations plan={plan} status={status} categories={categories.expense} onPay={() => setStatus('paid')} onCancel={() => setStatus('cancelled')} />
        <PurchaseForecast before={budget.limit} after={budget.after} />
        <ExpenseChart rows={rows} month="Май 2026" />
      </div>
      <TransactionList entries={entries} date="10 мая 2026" />
    </main>
  )
}
