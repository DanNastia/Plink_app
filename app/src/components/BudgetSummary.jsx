import { useState } from 'react'
import { money } from './money'

export default function BudgetSummary({ budget, budgetError, balanceKop, nextIncomeDate, onSaveDate }) {
  const [date, setDate] = useState(nextIncomeDate ?? '')
  const [message, setMessage] = useState('')
  const available = budget?.status === 'available'

  return <section className="summary" aria-label="Сводка бюджета">
    <form className="date-form" onSubmit={event => {
      event.preventDefault()
      setMessage(onSaveDate(date) ?? 'Дата сохранена.')
    }}>
      <label>Следующее поступление<input required type="date" value={date} onChange={event => {
        setDate(event.target.value)
        setMessage('')
      }} /></label><button>Применить дату</button><small role="status">{message}</small>
    </form>
    <div className="limit">
      <h2>Доступно в день</h2>
      {available ? <>
        <strong>{money(budget.dailyLimitKop)}</strong>
        <small>Дней до поступления · {budget.days}</small>
      </> : <small>{budgetError ?? 'Укажите будущую дату поступления.'}</small>}
    </div>
    <dl>
      <div><dt>Остаток</dt><dd>{money(balanceKop)}</dd></div>
      {available && <>
        <div><dt>На обязательные платежи</dt><dd>{money(budget.reserveKop)}</dd></div>
        <div><dt>Свободно до поступления</dt><dd>{money(budget.freeKop)}</dd></div>
        {budget.deficitKop > 0 && <div><dt>Не хватает</dt><dd>{money(budget.deficitKop)}</dd></div>}
      </>}
    </dl>
  </section>
}
