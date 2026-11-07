import { useEffect, useState } from 'react'
import { sb, upload } from './supabase'

const PF = [['name', 'Nombre'], ['description', 'Descripción', 'area'], ['ingredients', 'Ingredientes (uno por línea)', 'list'], ['price', 'Precio (ARS)', 'num'], ['image_url', 'Foto', 'img'], ['active', 'Visible en la web', 'bool']]
const OF = [['name', 'Nombre'], ['description', 'Descripción', 'area'], ['items', 'Componentes (uno por línea)', 'list'], ['price', 'Precio (ARS)', 'num'], ['image_url', 'Imagen', 'img'], ['active', 'Promoción activa', 'bool']]
const SF = [['hero_text', 'Presentación de Inicio', 'area'], ['slogan', 'Eslogan'], ['about', 'Texto de Nosotros', 'area'], ['instagram_user', 'Usuario de Instagram (ej: @santoantojo)'], ['instagram_url', 'Enlace de Instagram'], ['whatsapp_number', 'Número de WhatsApp (visible)'], ['whatsapp_url', 'Enlace de WhatsApp (https://wa.me/549...)']]

function Form({ fields, init, onSave, onDelete, notify }) {
  const [v, setV] = useState(init), [busy, setBusy] = useState(false)
  const set = (k, x) => setV(o => ({ ...o, [k]: x }))
  const run = async fn => { setBusy(true); try { await fn(); } catch (e) { notify(e.message, true) } setBusy(false) }
  return <div className="form">
    {fields.map(([k, label, t]) => <label key={k}>{label}
      {t === 'area' && <textarea rows="3" value={v[k] || ''} onChange={e => set(k, e.target.value)} />}
      {t === 'list' && <textarea rows="4" value={(v[k] || []).join('\n')} onChange={e => set(k, e.target.value.split('\n'))} />}
      {t === 'num' && <input type="number" min="0" value={v[k] ?? 0} onChange={e => set(k, e.target.value)} />}
      {t === 'bool' && <input type="checkbox" checked={!!v[k]} onChange={e => set(k, e.target.checked)} />}
      {t === 'img' && <>{v[k] && <img className="thumb" src={v[k]} alt="" />}
        <input type="file" accept="image/*" onChange={e => e.target.files[0] && run(async () => { set(k, await upload(e.target.files[0], v[k])); notify('Imagen subida. Recordá guardar los cambios.') })} />
        {v[k] && <button type="button" className="link" onClick={() => run(async () => { if (confirm('¿Quitar esta imagen?')) { const old = v[k]; set(k, null); if (old.includes('/images/')) await sb.storage.from('images').remove([decodeURIComponent(old.split('/images/')[1])]) } })}>Quitar imagen</button>}</>}
      {!t && <input value={v[k] || ''} onChange={e => set(k, e.target.value)} />}
    </label>)}
    <div className="row"><button disabled={busy} onClick={() => run(async () => { await onSave({ ...v, ingredients: v.ingredients?.filter(Boolean), items: v.items?.filter(Boolean), price: v.price !== undefined ? Number(v.price) : undefined }); notify('Cambios guardados.') })}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
      {onDelete && <button disabled={busy} className="danger" onClick={() => confirm('¿Eliminar definitivamente? No se puede deshacer.') && run(onDelete)}>Eliminar</button>}</div>
  </div>
}

function Rows({ table, fields, blank, notify }) {
  const [rows, setRows] = useState(null)
  const load = async () => { const { data, error } = await sb.from(table).select('*').order('created_at'); error ? notify(error.message, true) : setRows(data) }
  useEffect(() => { load() }, [table])
  const save = async v => {
    const { id, created_at, ...rest } = v
    const r = id ? await sb.from(table).update(rest).eq('id', id) : await sb.from(table).insert(rest)
    if (r.error) throw r.error; await load()
  }
  const del = async id => { const { error } = await sb.from(table).delete().eq('id', id); if (error) throw error; notify('Eliminado.'); await load() }
  if (!rows) return <p>Cargando…</p>
  return <>{rows.map(r => <details key={r.id}><summary>{r.name} {!r.active && '(oculto)'}</summary><Form fields={fields} init={r} onSave={save} onDelete={() => del(r.id)} notify={notify} /></details>)}
    <details open={!rows.length}><summary>+ Crear nuevo</summary><Form key={rows.length} fields={fields} init={blank} onSave={save} notify={notify} /></details></>
}

function Texts({ notify }) {
  const [init, setInit] = useState(null)
  useEffect(() => { sb.from('settings').select('*').then(({ data }) => setInit(Object.fromEntries((data || []).map(r => [r.key, r.value])))) }, [])
  if (!init) return <p>Cargando…</p>
  return <Form fields={SF} init={init} notify={notify} onSave={async v => {
    const { error } = await sb.from('settings').upsert(SF.map(([k]) => ({ key: k, value: v[k] || '' }))); if (error) throw error }} />
}

export default function Admin() {
  const [session, setSession] = useState(undefined), [tab, setTab] = useState('p'), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false)
  useEffect(() => { sb.auth.getSession().then(({ data }) => setSession(data.session)); const { data } = sb.auth.onAuthStateChange((_, s) => setSession(s)); return () => data.subscription.unsubscribe() }, [])
  const notify = (text, bad) => { setMsg({ text, bad }); setTimeout(() => setMsg(null), 4000) }
  const login = async e => {
    e.preventDefault(); setBusy(true); const f = new FormData(e.target)
    const { error } = await sb.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') })
    setBusy(false); if (error) notify('Usuario o contraseña incorrectos.', true)
  }
  if (session === undefined) return <div className="admin"><p>Cargando…</p></div>
  if (!session) return <div className="admin login"><img src="./logo.jpeg" alt="Santo Antojo" /><form onSubmit={login}>
    <h2>Panel de administración</h2><label>Correo<input name="email" type="email" required /></label>
    <label>Contraseña<input name="password" type="password" required /></label><button disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button></form>
    {msg && <div className={'toast ' + (msg.bad ? 'bad' : '')}>{msg.text}</div>}</div>
  return <div className="admin"><header><h2>Panel Santo Antojo</h2><a href="#/" target="_blank">Ver página</a><button className="link" onClick={() => sb.auth.signOut()}>Cerrar sesión</button></header>
    <div className="tabs">{[['p', 'Productos'], ['o', 'Combo / Promoción'], ['t', 'Textos y contacto']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</div>
    {tab === 'p' && <Rows table="products" fields={PF} notify={notify} blank={{ name: '', description: '', ingredients: [], price: 3500, image_url: null, active: true }} />}
    {tab === 'o' && <Rows table="promos" fields={OF} notify={notify} blank={{ name: '', description: '', items: [], price: 4000, image_url: null, active: true }} />}
    {tab === 't' && <Texts notify={notify} />}
    {msg && <div className={'toast ' + (msg.bad ? 'bad' : '')}>{msg.text}</div>}</div>
}
