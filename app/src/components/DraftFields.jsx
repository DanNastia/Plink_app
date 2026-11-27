import { useState } from 'react'

// Поля остаются в форме до подключения финансового модуля и хранилища.
export default function DraftFields({ categories, today, type, onSubmitDraft }) {
  const isPlan = type === 'plan'
  const [amount, setAmount] = useState('')
  const [categoryId, setCategory] = useState('')
  const [date, setDate] = useState(isPlan ? '' : today)
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState('')
  return <form onChange={() => setFeedback('')} onSubmit={event => {
    event.preventDefault()
    const fields = isPlan
      ? { title: text.trim(), rawAmount: amount, categoryId, dueDate: date }
      : { type, rawAmount: amount, categoryId, date, comment: text }
    setFeedback(onSubmitDraft(fields))
  }}>
    {isPlan && <label>Название<input required pattern=".*\S.*" value={text} onChange={e => setText(e.target.value)} /></label>}
    <div className="fields">
      <label>Сумма, ₽<input required inputMode="decimal" pattern="(?!0+([.,]0+)?$)[0-9]+([.,][0-9]{1,2})?" title="Введите положительную сумму, например 12,34" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" />
        <small className="input-error">Введите положительную сумму, например 12,34.</small></label>
      <label>Категория<select required value={categoryId} onChange={e => setCategory(e.target.value)}>
        <option value="">Выберите категорию</option>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select></label>
    </div>
    <label>{isPlan ? 'Срок оплаты' : 'Дата'}<input type="date" required max={isPlan ? undefined : today} value={date} onChange={e => setDate(e.target.value)} /></label>
    {!isPlan && <label>Комментарий (необязательно)<input value={text} onChange={e => setText(e.target.value)} /></label>}
    <button>Проверить черновик</button>
    <small role="status">{feedback}</small>
  </form>
}
