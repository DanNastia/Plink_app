import { money } from './money'

export default function ExpenseChart({ rows, month }) {
  return <section><h2>Расходы за месяц</h2><small>{month}</small>
    {rows.length === 0 && <p>В этом месяце расходов пока нет.</p>}
    {rows.map(row => <div className="chart-row" key={row.title}>
      <div className="line"><strong>{row.title}</strong><span>{money(row.amountKop)} · {row.percent}%</span></div>
      <div className="track" aria-hidden="true"><i style={{ width: row.percent + '%' }} /></div>
    </div>)}
  </section>
}
