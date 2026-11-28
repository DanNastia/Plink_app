import { useState } from 'react'
import { money } from './money'

export default function PurchaseForecast({ available, onForecast }) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState('')
  const showForecast = open && available
  let result
  let errorMessage
  if (showForecast && price !== '') {
    try {
      result = onForecast(price)
    } catch (error) {
      errorMessage = error.message
    }
  }

  function toggle() {
    setOpen(!open)
    setPrice('')
  }

  return <section><h2>Прогноз покупки</h2>
    <button disabled={!available} aria-expanded={showForecast} onClick={toggle}>{showForecast ? 'Закрыть' : 'Проверить покупку'}</button>
    {!available && <p>Прогноз доступен после выбора будущей даты поступления.</p>}
    {showForecast && <div className="forecast">
      <label>Стоимость покупки, ₽<input aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? 'price-error' : undefined} inputMode="decimal"
        value={price} onChange={event => setPrice(event.target.value)} /></label>
      {errorMessage && <p className="field-error" id="price-error">{errorMessage}</p>}
      {result && <dl>{[['Сейчас', result.before], ['После покупки', result.after]].map(([label, values]) =>
        <div key={label}><dt>{label}</dt><dd>{money(values.dailyLimitKop)} в день</dd><small>Дефицит {money(values.deficitKop)}</small></div>)}</dl>}
    </div>}
  </section>
}
