import { money } from './money'

export default function TransactionList({ entries, date }) {
  return <section><h2>Журнал операций</h2>
    {entries.length === 0 && <p>Операций пока нет.</p>}
    <ul>{entries.map(entry => <li key={entry.id}><div><strong>{entry.title}</strong><small>{date} · {entry.income ? 'Доход' : 'Расход'}</small></div>
      <b>{entry.income ? '+' : '−'}{money(entry.amountKop)}</b></li>)}</ul>
  </section>
}
