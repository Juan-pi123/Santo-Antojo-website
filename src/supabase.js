import { createClient } from '@supabase/supabase-js'
export const sb = createClient(import.meta.env.VITE_SUPABASE_URL || 'http://localhost', import.meta.env.VITE_SUPABASE_ANON_KEY || 'sin-configurar')

// Sube una imagen al bucket "images" y borra la anterior si estaba allí
export async function upload(file, old) {
  const path = `${Date.now()}-${file.name.replace(/[^\w.]/g, '_')}`
  const { error } = await sb.storage.from('images').upload(path, file)
  if (error) throw error
  if (old?.includes('/images/')) await sb.storage.from('images').remove([decodeURIComponent(old.split('/images/')[1])])
  return sb.storage.from('images').getPublicUrl(path).data.publicUrl
}
