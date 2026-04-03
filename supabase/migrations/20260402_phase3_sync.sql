create extension if not exists pgcrypto;

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  device_name text,
  platform text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create table if not exists public.sync_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  client_op_id text not null,
  entity_type text not null,
  entity_id text not null,
  parent_entity_type text,
  parent_entity_id text,
  op_type text not null,
  field_mask text[] not null default '{}',
  payload jsonb not null,
  lamport bigint not null,
  created_at timestamptz not null default now(),
  server_order bigint generated always as identity,
  unique (user_id, device_id, client_op_id)
);

create table if not exists public.entity_tombstones (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  deleted_by_op_id uuid not null references public.sync_operations(id) on delete cascade,
  deleted_server_order bigint not null,
  deleted_at timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);

create index if not exists sync_operations_user_server_order_idx
  on public.sync_operations (user_id, server_order);

alter table public.user_devices enable row level security;
alter table public.sync_operations enable row level security;
alter table public.entity_tombstones enable row level security;

create policy "user_devices_select_own"
  on public.user_devices
  for select
  using (auth.uid() = user_id);

create policy "user_devices_insert_own"
  on public.user_devices
  for insert
  with check (auth.uid() = user_id);

create policy "user_devices_update_own"
  on public.user_devices
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sync_operations_select_own"
  on public.sync_operations
  for select
  using (auth.uid() = user_id);

create policy "sync_operations_insert_own"
  on public.sync_operations
  for insert
  with check (auth.uid() = user_id);

create policy "sync_operations_update_own"
  on public.sync_operations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sync_operations_delete_own"
  on public.sync_operations
  for delete
  using (auth.uid() = user_id);

create policy "entity_tombstones_select_own"
  on public.entity_tombstones
  for select
  using (auth.uid() = user_id);

create policy "entity_tombstones_insert_own"
  on public.entity_tombstones
  for insert
  with check (auth.uid() = user_id);

create policy "entity_tombstones_update_own"
  on public.entity_tombstones
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entity_tombstones_delete_own"
  on public.entity_tombstones
  for delete
  using (auth.uid() = user_id);
