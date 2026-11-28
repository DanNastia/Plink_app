import { displayDate } from './budgetView.js'
import { money } from './money'

export default function TransactionList({ entries, categories }) {
  const sorted = [...entries].reverse().sort((first, second) => second.date.localeCompare(first.date))
  return <section><h2>Журнал операций</h2>
    {entries.length === 0 && <p>Операций пока нет. Имеющиеся деньги можно внести как доход «Начальный остаток».</p>}
    <ul>{sorted.map(entry => {
      const income = entry.type === 'income'
      const [, title] = categories[entry.type].find(([id]) => id === entry.categoryId)
      return <li key={entry.id}>
        <div><strong>{title}</strong><small>{displayDate(entry.date)} · {income ? 'Доход' : 'Расход'}</small>
          {entry.comment && <small>{entry.comment}</small>}
        </div>
        <b>{income ? '+' : '−'}{money(entry.amountKop)}</b>
      </li>
    })}</ul>
  </section>
}
