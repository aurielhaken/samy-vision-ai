-- Hard reset: drop memory_entries table and its policies
alter table if exists public.memory_entries disable row level security;

drop policy if exists "Read own memory entries" on public.memory_entries;
drop policy if exists "Insert own memory entries" on public.memory_entries;
drop policy if exists "Delete own memory entries" on public.memory_entries;

drop table if exists public.memory_entries;