import { useState } from 'react'
import { money } from './money'

export default function PurchaseForecast({ onForecast }) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState('150')
  const invalidPrice = !/^\d+(?:[.,]\d{1,2})?$/.test(price) || /^0+(?:[.,]0+)?$/.test(price)
  const result = open && !invalidPrice ? onForecast(price) : null
  function toggle() {
    setOpen(!open)
    setPrice('150')
  }
  return <section><h2>Прогноз покупки</h2>
    <button aria-expanded={open} onClick={toggle}>{open ? 'Закрыть' : 'Проверить покупку'}</button>
    {open && <div className="forecast"><label>Стоимость покупки, ₽<input aria-invalid={invalidPrice} aria-describedby={invalidPrice ? "price-error" : undefined} inputMode="decimal" value={price} onChange={event => setPrice(event.target.value)} /></label>
      {result ? <dl>{[['Сейчас', result.before], ['После покупки', result.after]].map(([label, values]) =>
        <div key={label}><dt>{label}</dt><dd>{money(values.dailyLimitKop)} в день</dd><small>Дефицит {money(values.deficitKop)}</small></div>)}</dl> : invalidPrice ? <p className="field-error" id="price-error">Введите положительную сумму, например 12,34.</p> : <p>Демонстрационный прогноз доступен для покупки за 150 ₽.</p>}
    </div>}
  </section>
}
