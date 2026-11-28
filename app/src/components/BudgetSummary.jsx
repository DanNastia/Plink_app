import { useState } from 'react'
import { money } from './money'

export default function BudgetSummary({ budget, nextIncomeDate, days, today, onSaveDate }) {
  const [date, setDate] = useState(nextIncomeDate ?? '')
  const [message, setMessage] = useState('')
  return <section className="summary" aria-label="Сводка бюджета">
    <form className="date-form" onSubmit={event => {
      event.preventDefault()
      setMessage(date > today ? onSaveDate(date) : 'Выберите будущую дату поступления.')
    }}>
      <label>Следующее поступление<input required type="date" value={date} onChange={event => {
        setDate(event.target.value)
        setMessage('')
      }} /></label><button>Применить дату</button><small role="status">{message}</small>
    </form>
    <div className="limit"><h2>Доступно в день</h2><strong>{money(budget.limit)}</strong><small>До поступления · {days} дня</small></div>
    <dl>{[['Остаток', budget.balance], ['На обязательные платежи', budget.reserve], ['Свободно до поступления', budget.free]].map(([title, value]) =>
      <div key={title}><dt>{title}</dt><dd>{money(value)}</dd></div>)}</dl>
  </section>
}
