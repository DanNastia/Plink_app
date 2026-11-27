import { useState } from 'react'
import DraftFields from './DraftFields'

export default function TransactionForm({ categories, today, onAddTransaction }) {
  const [type, setType] = useState('expense')
  return <section><h2>Добавить операцию</h2>
    <div className="switch">{[['expense', 'Расход'], ['income', 'Доход']].map(([value, title]) =>
      <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)}>{title}</button>)}</div>
    <DraftFields key={type} type={type} categories={categories[type]} today={today} onSubmitDraft={onAddTransaction} />
  </section>
}
