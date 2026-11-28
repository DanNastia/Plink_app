import { useState } from 'react'

export default function DraftFields({ categories, today, type, onSubmitDraft }) {
  const isPlan = type === 'plan'
  const [amount, setAmount] = useState('')
  const [categoryId, setCategory] = useState('')
  const defaultDate = isPlan ? '' : today
  const [selectedDate, setDate] = useState(null)
  const date = selectedDate ?? defaultDate
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState('')
  return <form onChange={() => setFeedback('')} onSubmit={event => {
    event.preventDefault()
    const fields = isPlan
      ? { title: text.trim(), rawAmount: amount, categoryId, dueDate: date }
      : { type, rawAmount: amount, categoryId, date, comment: text }
    const error = onSubmitDraft(fields)
    setFeedback(error ?? (isPlan ? 'Платёж сохранён.' : 'Операция добавлена.'))
    if (error) return

    setAmount('')
    setCategory('')
    setDate(null)
    setText('')
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
    <button>{isPlan ? 'Сохранить платёж' : type === 'income' ? 'Добавить доход' : 'Добавить расход'}</button>
    <small role="status">{feedback}</small>
  </form>
}
