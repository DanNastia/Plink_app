import { useState } from 'react'

export default function TransactionForm({ categories, today }) {
  const [type, setType] = useState('expense')
  return <section><h2>Добавить операцию</h2>
    <form onSubmit={event => event.preventDefault()}>
      <div className="switch">{[['expense', 'Расход'], ['income', 'Доход']].map(([value, title]) =>
        <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)}>{title}</button>)}</div>
      <div className="fields"><label>Сумма, ₽<input inputMode="decimal" placeholder="0,00" /></label>
        <label>Категория<select key={type} defaultValue=""><option value="">Выберите категорию</option>{categories[type].map(name => <option key={name}>{name}</option>)}</select></label></div>
      <label>Дата<input type="date" defaultValue={today} max={today} /></label>
      <label>Комментарий (необязательно)<input /></label>
      <button disabled>{type === 'income' ? 'Добавить доход' : 'Добавить расход'}</button>
      <small>Сохранение введённых данных в деморежиме отключено.</small>
    </form>
  </section>
}
