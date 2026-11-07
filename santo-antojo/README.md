# Santo Antojo – Sitio web con panel de administración

Panel privado: `https://TU-USUARIO.github.io/NOMBRE-REPO/#/admin`

## 1. Supabase (base de datos, login e imágenes)
1. Entrá a https://supabase.com → **Start your project** → creá cuenta (gratis).
2. **New project** → poné un nombre (ej. santo-antojo), una contraseña de base de datos (guardala) y elegí región → **Create**. Esperá 1-2 minutos.
3. Menú izquierdo **SQL Editor** → **New query** → abrí `supabase_setup.sql`, copiá TODO, pegalo → botón **Run**. Debe decir "Success".
4. **Authentication → Sign In / Providers** (o *Settings*) → desactivá **"Allow new users to sign up"** → Save. (Importante: así nadie puede crearse una cuenta).
5. **Authentication → Users → Add user → Create new user**: poné un correo y una contraseña (será la cuenta compartida) y tildá **Auto Confirm User**. Compartí estas credenciales solo con el equipo.
6. **Project Settings → API**: copiá **Project URL** y la clave **anon / public**. (NUNCA uses la `service_role`).

## 2. GitHub y publicación
1. https://github.com → **New repository** (público, nombre ej. `santo-antojo`) → subí todos los archivos de esta carpeta (**uploading an existing file**, incluí la carpeta `.github`).
2. Repo → **Settings → Secrets and variables → Actions → New repository secret**: creá `VITE_SUPABASE_URL` (Project URL) y `VITE_SUPABASE_ANON_KEY` (clave anon).
3. **Settings → Pages → Source: GitHub Actions**.
4. Pestaña **Actions**: esperá que termine "Publicar en GitHub Pages" (si no arrancó, **Run workflow**). La web queda en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## 3. Uso local (opcional)
Copiá `.env.example` a `.env`, completalo, y ejecutá `npm install` y `npm run dev`.

## 4. Datos pendientes (se cargan desde el panel)
Instagram (usuario y enlace), WhatsApp (número y enlace `https://wa.me/549XXXXXXXXXX`), fotos definitivas de cada sándwich y del combo.
