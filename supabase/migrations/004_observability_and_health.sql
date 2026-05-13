-- 004_observability_and_health.sql

create table if not exists error_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  user_id uuid,
  error_code text not null,
  message text not null,
  metadata jsonb default '{}'::jsonb,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists integration_health (
  name text primary key,
  status text not null check (status in ('operational','degraded','down')),
  last_error text,
  updated_at timestamptz default now()
);

create table if not exists recovery_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  error_code text,
  status text default 'pending',
  assigned_to uuid,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  entity text not null,
  status text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists job_queue_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid,
  status text not null,
  error_message text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table error_events enable row level security;
alter table integration_health enable row level security;
alter table recovery_tasks enable row level security;
alter table sync_logs enable row level security;
alter table job_queue_logs enable row level security;

-- Policies for platform admins
create policy error_events_platform_admin on error_events for all using (public.is_platform_admin());
create policy health_platform_admin on integration_health for all using (public.is_platform_admin());
create policy health_public_read on integration_health for select using (true);
create policy recovery_platform_admin on recovery_tasks for all using (public.is_platform_admin());
