import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import Site from './Site'
import Admin from './Admin'
import './styles.css'
// Se usa "#/admin" para que funcione en GitHub Pages sin errores 404
function App() {
  const [h, setH] = useState(location.hash)
  useEffect(() => { const f = () => setH(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h.startsWith('#/admin') ? <Admin /> : <Site />
}
createRoot(document.getElementById('root')).render(<App />)
