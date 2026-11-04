-- Skema Supabase (Postgres) untuk Main Pintar.
-- Jalankan di SQL editor Supabase. Semua tabel memakai Row Level Security (RLS):
-- orang tua HANYA bisa melihat/mengubah data anaknya sendiri.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- anak
create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 20),
  avatar      text not null,
  created_at  timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children(parent_id);

-- ---------------------------------------------------------------- sesi bermain
create table if not exists public.sessions (
  id          uuid primary key,                       -- dibuat di klien, jadi sinkronisasi idempoten
  child_id    uuid not null references public.children(id) on delete cascade,
  game_id     text not null,
  level_id    text not null,
  category    text not null,
  score       int  not null check (score >= 0),
  total       int  not null check (total > 0),
  played_at   timestamptz not null,
  check (score <= total)
);
create index if not exists sessions_child_time_idx on public.sessions(child_id, played_at desc);

-- ---------------------------------------------------------------- hak akses (premium)
-- Hanya diisi oleh webhook (service role) dari RevenueCat / penyedia pembayaran.
create table if not exists public.entitlements (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  premium     boolean not null default false,
  source      text not null default 'none' check (source in ('none','play','web','dev')),
  until       timestamptz,                             -- null = tidak berakhir
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- RLS
alter table public.children     enable row level security;
alter table public.sessions     enable row level security;
alter table public.entitlements enable row level security;

create policy "children: pemilik" on public.children
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

create policy "sessions: pemilik anak" on public.sessions
  for all
  using (exists (select 1 from public.children c where c.id = sessions.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from public.children c where c.id = sessions.child_id and c.parent_id = auth.uid()));

-- entitlement: pengguna hanya boleh MEMBACA miliknya. Tidak ada policy insert/update,
-- jadi klien tidak bisa memberi dirinya premium. Webhook memakai service role (melewati RLS).
create policy "entitlements: baca milik sendiri" on public.entitlements
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------- penghapusan data (hak orang tua)
-- Menghapus akun di auth.users otomatis menghapus children -> sessions -> entitlements (on delete cascade).

-- ---------------------------------------------------------------- hapus akun (dipanggil dari aplikasi: rpc('delete_my_account'))
-- security definer: berjalan sebagai pemilik fungsi sehingga boleh menghapus baris auth.users miliknya sendiri.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();   -- cascade: children -> sessions, entitlements
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
