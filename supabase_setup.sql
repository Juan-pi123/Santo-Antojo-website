-- SANTO ANTOJO: pegar completo en Supabase > SQL Editor > Run
create table if not exists products(
  id uuid primary key default gen_random_uuid(), name text not null, description text default '',
  ingredients text[] default '{}', price integer not null default 0, image_url text,
  active boolean not null default true, sort integer not null default 0, created_at timestamptz default now());
create table if not exists promos(
  id uuid primary key default gen_random_uuid(), name text not null, description text default '',
  items text[] default '{}', price integer not null default 0, image_url text,
  active boolean not null default true, created_at timestamptz default now());
create table if not exists settings(key text primary key, value text not null default '');

alter table products enable row level security;
alter table promos enable row level security;
alter table settings enable row level security;
do $$ declare t text; begin
  foreach t in array array['products','promos','settings'] loop
    execute format('drop policy if exists "lectura publica" on %I', t);
    execute format('drop policy if exists "admin escribe" on %I', t);
    execute format('create policy "lectura publica" on %I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin escribe" on %I for all to authenticated using (true) with check (true)', t);
  end loop; end $$;
revoke all on products, promos, settings from anon;
grant select on products, promos, settings to anon;
grant all on products, promos, settings to authenticated;

insert into products(name,description,ingredients,price,sort) values
('Jamón y queso','El clásico, en pan francés crujiente.','{Paleta,Queso,Aderezo a elección}',3500,1),
('Primavera','Fresco y completo, en pan francés.','{Paleta,Queso,Lechuga,Tomate,Aderezo a elección}',3500,2),
('Salame y queso','Sabor intenso en pan francés.','{Salame,Queso,Aderezo a elección}',3500,3);
insert into promos(name,description,items,price) values
('Combo Santo Antojo','Promoción especial de la Expo.','{Un sándwich a elección,Un vaso de gaseosa}',4000);
insert into settings(key,value) values
('hero_text','Sándwiches de pan francés, bien armados y a precios accesibles.'),
('slogan','Crujiente por fuera, glorioso por dentro'),
('about','Santo Antojo nació como un emprendimiento escolar de alumnos del Colegio Hermanos Maristas. Trabajamos en equipo, con iniciativa y compromiso con la calidad.'),
('instagram_user',''),('instagram_url',''),('whatsapp_number',''),('whatsapp_url','')
on conflict (key) do nothing;

-- Imágenes: bucket público (lectura), escritura solo para el admin
insert into storage.buckets(id,name,public) values('images','images',true) on conflict (id) do nothing;
drop policy if exists "img lectura" on storage.objects;
drop policy if exists "img admin" on storage.objects;
create policy "img lectura" on storage.objects for select using (bucket_id='images');
create policy "img admin" on storage.objects for all to authenticated using (bucket_id='images') with check (bucket_id='images');
