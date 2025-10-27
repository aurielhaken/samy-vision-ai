-- Create table for memory entries used by the memory edge function
-- Ensure pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  content text not null,
  type text not null default 'analysis',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_memory_entries_created_at on public.memory_entries (created_at desc);
create index if not exists idx_memory_entries_type on public.memory_entries (type);
create index if not exists idx_memory_entries_user_id on public.memory_entries (user_id);

-- Enable Row Level Security
alter table public.memory_entries enable row level security;

-- Policies: users can manage their own entries when authenticated
-- Drop existing policies first if they exist
drop policy if exists "Read own memory entries" on public.memory_entries;
drop policy if exists "Insert own memory entries" on public.memory_entries;
drop policy if exists "Delete own memory entries" on public.memory_entries;

-- Create policies
create policy "Read own memory entries" on public.memory_entries
for select using (auth.uid() = user_id);

create policy "Insert own memory entries" on public.memory_entries
for insert with check (auth.uid() = user_id);

create policy "Delete own memory entries" on public.memory_entries
for delete using (auth.uid() = user_id);
