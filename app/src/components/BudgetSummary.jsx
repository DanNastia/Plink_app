import { money } from './money'

export default function BudgetSummary({ budget, nextIncomeDate, days }) {
  return <section className="summary" aria-label="Сводка бюджета">
    <label>Следующее поступление<input type="date" value={nextIncomeDate} readOnly /></label>
    <div className="limit"><h2>Доступно в день</h2><strong>{money(budget.limit)}</strong><small>До поступления · {days} дня</small></div>
    <dl>{[['Остаток', budget.balance], ['На обязательные платежи', budget.reserve], ['Свободно до поступления', budget.free]].map(([title, value]) =>
      <div key={title}><dt>{title}</dt><dd>{money(value)}</dd></div>)}</dl>
  </section>
}
