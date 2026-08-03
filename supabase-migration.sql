-- ============================================
-- Sparky Notes — Supabase migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ideas table
create table if not exists public.ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  raw_text text not null,
  title text not null default 'Sem título',
  summary text default '',
  category text default 'geral',
  tags jsonb default '[]'::jsonb,
  suggested_stack jsonb default '[]'::jsonb,
  questions jsonb default '[]'::jsonb,
  status text default 'spark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- indexes
create index if not exists ideas_user_id_idx on public.ideas(user_id);
create index if not exists ideas_status_idx on public.ideas(status);
create index if not exists ideas_category_idx on public.ideas(category);
create index if not exists ideas_created_at_idx on public.ideas(created_at desc);

-- RLS (Row Level Security) — each user only sees their own ideas
alter table public.ideas enable row level security;

create policy "Users can view own ideas"
  on public.ideas for select
  using (auth.uid() = user_id);

create policy "Users can create own ideas"
  on public.ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ideas"
  on public.ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete own ideas"
  on public.ideas for delete
  using (auth.uid() = user_id);

-- auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.update_updated_at();
