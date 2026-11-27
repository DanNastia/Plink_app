import BudgetSummary from './components/BudgetSummary'
import TransactionForm from './components/TransactionForm'
import Obligations from './components/Obligations'
import PurchaseForecast from './components/PurchaseForecast'
import ExpenseChart from './components/ExpenseChart'
import TransactionList from './components/TransactionList'
import './App.css'

const categories = { income: [['stipend', 'Стипендия'], ['opening', 'Начальный остаток']], expense: [['food', 'Продукты'], ['home', 'ЖКХ'], ['transport', 'Транспорт']] }
const initialEntries = [
  { id: 't2', title: 'Продукты', income: false, amountKop: 10000 },
  { id: 't1', title: 'Стипендия', income: true, amountKop: 100000 },
]
const food = { title: 'Продукты', amountKop: 10000, percent: 100 }
const plan = { id: 'p1', title: 'ЖКХ', amountKop: 30000, due: '12 мая' }
// Готовые снимки сценария A-04. Итоги позднее предоставит финансовый модуль.
const budget = { balance: 90000, reserve: 30000, free: 60000, limit: 20000 }

// На этапе интеграции App передаст rawAmount в parseAmountKop.
function previewDraft({ rawAmount, categoryId }) {
  const label = Object.values(categories).flat().find(([id]) => id === categoryId)?.[1]
  return `Черновик: ${label}, ${rawAmount} ₽. Сохранение пока недоступно.`
}

function previewForecast(rawPrice) {
  return /^150([.,]0{1,2})?$/.test(rawPrice)
    ? { before: { dailyLimitKop: 20000, deficitKop: 0 }, after: { dailyLimitKop: 15000, deficitKop: 0 } }
    : null
}

export default function App() {
  return (
    <main lang="ru">
      <header><span className="brand">plink<span>.</span></span><span>Деморежим · 10 мая 2026</span></header>
      <h1>Мой бюджет</h1>
      <BudgetSummary budget={budget} nextIncomeDate="2026-05-13" days={3} today="2026-05-10" onSaveDate={() => 'Сохранение даты пока недоступно. Сводка показывает пример.'} />
      <div className="grid">
        <TransactionForm onAddTransaction={previewDraft} categories={categories} today="2026-05-10" />
        <Obligations plan={plan} categories={categories.expense} onAdd={previewDraft} onPay={() => 'Оплата пока недоступна. Расход не создан.'} onCancel={() => 'Отмена пока недоступна. План остаётся в списке.'} />
        <PurchaseForecast onForecast={previewForecast} />
        <ExpenseChart rows={[food]} month="Май 2026" />
      </div>
      <TransactionList entries={initialEntries} date="10 мая 2026" />
    </main>
  )
}
