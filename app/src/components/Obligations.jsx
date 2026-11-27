import { useState } from 'react'
import DraftFields from './DraftFields'
import { money } from './money'

export default function Obligations({ plan, categories, onAdd, onPay, onCancel }) {
  const [message, setMessage] = useState('')
  return <section><h2>Обязательные платежи</h2>
    {plan ? <div className="plan">
      <div className="line"><strong>{plan.title}</strong><b>{money(plan.amountKop)}</b></div>
      <p>До {plan.due} · В резерве</p>
      <div className="actions"><button onClick={() => setMessage(onPay(plan.id))}>Оплатить</button>
        <button className="secondary" onClick={() => setMessage(onCancel(plan.id))}>Отменить план</button></div>
      <small role="status">{message}</small>
    </div> : <p>Обязательных платежей пока нет.</p>}
    <details><summary>Добавить платёж</summary>
      <DraftFields type="plan" categories={categories} onSubmitDraft={onAdd} />
    </details>
  </section>
}
