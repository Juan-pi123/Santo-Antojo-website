import { useEffect, useState } from 'react'
import { sb } from './supabase'

const money = n => '$' + Number(n).toLocaleString('es-AR')
const Pic = ({ src, alt }) => src ? <img src={src} alt={alt} loading="lazy" /> : <div className="ph">Foto pendiente</div>
const Insta = () => <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
const Wapp = () => <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21l1.5-4.6A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8c-1-.4-2-1.400-2.400-2.400l.8-1-1-2z" fill="currentColor" stroke="none"/></svg>

export default function Site() {
  const [d, setD] = useState({ products: [], promo: null, s: {} }), [err, setErr] = useState(false)
  useEffect(() => {
    Promise.all([
      sb.from('products').select('*').eq('active', true).order('sort'),
      sb.from('promos').select('*').eq('active', true).limit(1),
      sb.from('settings').select('*')]).then(([p, o, s]) => {
      if (p.error || s.error) return setErr(true)
      setD({ products: p.data, promo: o.data[0], s: Object.fromEntries(s.data.map(r => [r.key, r.value])) })
    })
  }, [])
  const { products, promo, s } = d
  const Contact = ({ url, user, icon, label }) => url
    ? <a className="contact" href={url} target="_blank" rel="noopener">{icon}<b>{label}</b><span>{user}</span></a>
    : <div className="contact off">{icon}<b>{label}</b><span>Pendiente de configuración</span></div>
  return <>
    <header className="nav"><a href="#inicio"><img src="./logo.jpeg" alt="Santo Antojo" /></a>
      <nav>{[['catalogo', 'Catálogo'], ['combo', 'Promo'], ['nosotros', 'Nosotros'], ['contacto', 'Contacto']].map(([i, t]) => <a key={i} href={'#' + i}>{t}</a>)}</nav></header>
    <main>
      <section id="inicio" className="hero">
        <img className="logo" src="./logo.jpeg" alt="Logo Santo Antojo" />
        <div className="rise"><p className="eyebrow">Sandwichería · Pan francés</p>
          <h1>{s.slogan || 'Crujiente por fuera, glorioso por dentro'}</h1>
          <p>{s.hero_text}</p><a className="btn" href="#catalogo">Ver catálogo</a></div>
      </section>
      {err && <p className="notice">No se pudo conectar con la base de datos. Revisá la configuración de Supabase.</p>}
      <section id="catalogo" className="sec"><h2>Catálogo</h2>
        <p className="lead"><span className="badge">100% pan francés</span> Nada de pebetes: todos nuestros sándwiches van en pan francés.</p>
        <div className="grid">{products.map(p => <article className="card rise" key={p.id}>
          <Pic src={p.image_url} alt={p.name} />
          <div className="body"><h3>{p.name}</h3><p>{p.description}</p>
            <ul>{p.ingredients?.map(i => <li key={i}>{i}</li>)}</ul><div className="price">{money(p.price)}</div></div></article>)}</div>
      </section>
      {promo && <section id="combo" className="combo"><div className="combo-in">
        <Pic src={promo.image_url} alt={promo.name} />
        <div><span className="tag">Promo Expo</span><h2>{promo.name}</h2><p>{promo.description}</p>
          <ul>{promo.items?.map(i => <li key={i}>{i}</li>)}</ul>
          <div className="big">{money(promo.price)}</div></div></div></section>}
      <section id="nosotros" className="sec about"><h2>Nosotros</h2><p>{s.about}</p></section>
      <section id="contacto" className="sec"><h2>Contacto</h2><div className="contacts">
        <Contact url={s.instagram_url} user={s.instagram_user} icon={<Insta />} label="Instagram" />
        <Contact url={s.whatsapp_url} user={s.whatsapp_number} icon={<Wapp />} label="WhatsApp" /></div></section>
    </main>
    <footer><img src="./logo.jpeg" alt="Santo Antojo" /><p className="eyebrow">{s.slogan}</p>
      <small>Emprendimiento escolar · Colegio Hermanos Maristas</small></footer>
  </>
}
