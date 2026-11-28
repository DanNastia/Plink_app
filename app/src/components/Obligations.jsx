import { useState } from 'react'
import DraftFields from './DraftFields'
import { displayDate } from './budgetView.js'
import { money } from './money'

function planStatus(plan, today, nextIncomeDate) {
  if (plan.paidTransactionId !== null) return 'Оплачено'
  const parts = []
  if (nextIncomeDate) parts.push(plan.dueDate < nextIncomeDate ? 'В резерве' : 'На следующий период')
  if (plan.dueDate < today) parts.push('Просрочен')
  return parts.length ? parts.join(' · ') : 'Запланировано'
}

export default function Obligations({ plans, categories, today, nextIncomeDate, onAdd, onPay, onCancel }) {
  const [message, setMessage] = useState('')
  return <section><h2>Обязательные платежи</h2>
    {plans.length === 0 && <p>Обязательных платежей пока нет.</p>}
    {plans.map(plan => <div className="plan" key={plan.id}>
      <div className="line"><strong>{plan.title}</strong><b>{money(plan.amountKop)}</b></div>
      <small>{categories.find(([id]) => id === plan.categoryId)?.[1]}</small>
      <p>До {displayDate(plan.dueDate)} · {planStatus(plan, today, nextIncomeDate)}</p>
      {plan.paidTransactionId === null && <div className="actions">
        <button onClick={() => setMessage(onPay(plan.id) ?? 'Платёж оплачен.')}>Оплатить</button>
        <button className="secondary" onClick={() => setMessage(onCancel(plan.id) ?? 'План отменён.')}>Отменить план</button>
      </div>}
    </div>)}
    <small role="status">{message}</small>
    <details><summary>Добавить платёж</summary>
      <DraftFields type="plan" categories={categories} onSubmitDraft={onAdd} />
    </details>
  </section>
}
