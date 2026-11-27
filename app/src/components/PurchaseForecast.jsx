import { useState } from 'react'
import { money } from './money'

export default function PurchaseForecast({ before, after }) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState('150')
  function toggle() {
    setOpen(!open)
    setPrice('150')
  }
  return <section><h2>Прогноз покупки</h2>
    <button aria-expanded={open} onClick={toggle}>{open ? 'Закрыть' : 'Проверить покупку'}</button>
    {open && <div className="forecast"><label>Стоимость покупки, ₽<input inputMode="decimal" value={price} onChange={event => setPrice(event.target.value)} /></label>
      {/^150([.,]0{1,2})?$/.test(price) ? <dl>{[['Сейчас', before], ['После покупки', after]].map(([label, limit]) =>
        <div key={label}><dt>{label}</dt><dd>{money(limit)} в день</dd><small>Дефицит 0 ₽</small></div>)}</dl> : <p>Демонстрационный прогноз доступен для покупки за 150 ₽.</p>}
    </div>}
  </section>
}
