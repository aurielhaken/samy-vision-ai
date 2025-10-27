-- Create memory_entries table and policies
create extension if not exists pgcrypto;

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  type text not null default 'analysis',
  metadata jsonb not null default '{}'::jsonb,
  user_id uuid null,
  created_at timestamptz not null default now()
);

-- Ensure row level security is enabled
alter table public.memory_entries enable row level security;

-- Drop existing policies if any to avoid duplicates
do $$
begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_entries' and policyname = 'Users can view their own memory entries'
  ) then
    drop policy "Users can view their own memory entries" on public.memory_entries;
  end if;
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_entries' and policyname = 'Users can insert their own memory entries'
  ) then
    drop policy "Users can insert their own memory entries" on public.memory_entries;
  end if;
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_entries' and policyname = 'Users can delete their own memory entries'
  ) then
    drop policy "Users can delete their own memory entries" on public.memory_entries;
  end if;
end $$;

-- RLS Policies: scope to owner when authenticated
create policy "Users can view their own memory entries"
  on public.memory_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memory entries"
  on public.memory_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own memory entries"
  on public.memory_entries
  for delete
  using (auth.uid() = user_id);

-- Optional index for faster queries
create index if not exists idx_memory_entries_user_created_at on public.memory_entries (user_id, created_at desc);
