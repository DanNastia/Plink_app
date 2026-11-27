import { money } from './money'

export default function Obligations({ plan, status, categories, onPay, onCancel }) {
  return <section><h2>Обязательные платежи</h2>
    {status === 'cancelled' ? <p>Обязательных платежей пока нет.</p> : <div className="plan">
      <div className="line"><strong>{plan.title}</strong><b>{money(plan.amountKop)}</b></div>
      <p>До {plan.due} · {status === 'paid' ? 'Оплачено' : 'В резерве'}</p>
      {status === 'pending' && <div className="actions"><button onClick={onPay}>Оплатить</button><button className="secondary" onClick={onCancel}>Отменить план</button></div>}
    </div>}
    <details><summary>Добавить платёж</summary><form onSubmit={event => event.preventDefault()}>
      <label>Название<input /></label><label>Сумма, ₽<input inputMode="decimal" /></label>
      <label>Категория<select>{categories.map(name => <option key={name}>{name}</option>)}</select></label>
      <label>Срок оплаты<input type="date" /></label><button disabled>Сохранить платёж</button>
      <small>Сохранение доступно после подключения финансового ядра.</small>
    </form></details>
  </section>
}
