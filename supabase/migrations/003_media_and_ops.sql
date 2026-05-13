-- 003_media_and_ops.sql
-- Media, Social, Notifications, Jobs, Audit, and SaaS Ops

-- 1. Media Nucleus
create table if not exists video_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  storage_url text not null,
  thumbnail_url text,
  duration numeric,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists live_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  status text not null default 'scheduled',
  platform text,
  ingest_url text,
  stream_key text,
  embed_url text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null check (type in ('recorded_video','live','replay','external_post')),
  title text not null,
  description text,
  bling_product_id text not null,
  asset_id uuid, -- Reference to video_assets or live_sessions
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Social
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  platform text not null,
  external_id text,
  name text,
  created_at timestamptz default now()
);

create table if not exists social_account_capabilities (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  capability text not null, -- autopost, live, sync
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- 3. Automation & Webhooks
create table if not exists notification_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  scheduled_at timestamptz,
  status text default 'pending',
  retry_count int default 0,
  created_at timestamptz default now()
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  provider text not null,
  external_event_id text,
  payload jsonb not null,
  status text default 'received',
  processed_at timestamptz,
  created_at timestamptz default now(),
  unique (provider, external_event_id)
);

create table if not exists publication_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  media_item_id uuid not null references media_items(id),
  platform text not null,
  status text default 'pending',
  retry_count int default 0,
  created_at timestamptz default now()
);

-- 4. SaaS Ops
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  features jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_id uuid references plans(id),
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists usage_metering (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  metric text not null,
  quantity numeric default 0,
  period_start date,
  created_at timestamptz default now()
);

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_enabled_globally boolean default false,
  created_at timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid,
  subject text not null,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 5. Enable RLS
alter table video_assets enable row level security;
alter table live_sessions enable row level security;
alter table media_items enable row level security;
alter table social_accounts enable row level security;
alter table social_account_capabilities enable row level security;
alter table notification_jobs enable row level security;
alter table webhook_events enable row level security;
alter table publication_jobs enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table usage_metering enable row level security;
alter table feature_flags enable row level security;
alter table support_tickets enable row level security;
alter table audit_logs enable row level security;

-- 6. Policies
create policy media_items_select on media_items
  for select using (public.is_tenant_member(tenant_id));

create policy media_items_admin_manage on media_items
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy plans_public_read on plans
  for select using (true);

create policy social_accounts_platform_admin_only on social_accounts
  for all using (public.is_platform_admin());

create policy audit_logs_admin_only on audit_logs
  for select using (public.has_tenant_role(tenant_id, array['owner','admin']));
