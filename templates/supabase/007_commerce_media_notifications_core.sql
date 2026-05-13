-- 007_commerce_media_notifications_core.sql
-- Completes the operational Lego pieces that connect Bling, media, checkout, receivables, affiliates, push and logs.

create extension if not exists pgcrypto;

-- Expand tenant member roles for SaaS operations.
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'tenant_members' and constraint_name = 'tenant_members_role_check'
  ) then
    alter table tenant_members drop constraint tenant_members_role_check;
  end if;

  alter table tenant_members add constraint tenant_members_role_check
    check (role in ('owner','admin','seller','live_host','affiliate','affiliate_manager','finance','viewer','support'));
exception when duplicate_object then
  null;
end $$;

-- Bling and product operational tables --------------------------------------
create table if not exists bling_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid,
  bling_account_id text,
  status text not null default 'connected', -- connected, reconnect_required, disabled, error
  access_token_secret_ref text,
  refresh_token_secret_ref text,
  expires_at timestamptz,
  granted_scopes text[] default '{}',
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

create table if not exists bling_channels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  bling_store_id text,
  bling_store_code text,
  name text not null,
  type text, -- marketplace, ecommerce, social_commerce, delivery, owned_channel
  platform text,
  status text default 'active',
  supports_product_sync boolean default false,
  supports_order_import boolean default false,
  supports_stock_sync boolean default false,
  supports_price_sync boolean default false,
  supports_image_sync boolean default false,
  supports_invoice_sync boolean default false,
  supports_shipping_sync boolean default false,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, platform, coalesce(bling_store_id,''), coalesce(bling_store_code,''))
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  bling_product_id text not null,
  image_url text not null,
  alt_text text,
  position int default 0,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_channel_map (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  bling_product_id text not null,
  bling_channel_id uuid references bling_channels(id) on delete set null,
  external_product_id text,
  external_sku text,
  external_url text,
  price_override numeric,
  stock_override numeric,
  status text default 'unknown',
  last_sync_at timestamptz,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media publication and autopost jobs ---------------------------------------
create table if not exists video_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  created_by uuid,
  title text not null,
  description text,
  caption text,
  hashtags text[] default '{}',
  source_type text not null default 'recorded', -- recorded, live_replay, uploaded, generated
  file_url text,
  temporary_upload_url text,
  thumbnail_url text,
  duration_seconds int,
  bling_product_id text not null,
  sku text,
  product_snapshot jsonb not null default '{}'::jsonb,
  status text default 'draft', -- draft, rendering, ready, publishing, published, failed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists video_publications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  video_asset_id uuid not null references video_assets(id) on delete cascade,
  media_item_id uuid references media_items(id) on delete set null,
  platform text not null,
  social_account_target_id uuid,
  external_post_id text,
  external_video_id text,
  post_url text,
  embed_url text,
  publish_status text default 'queued', -- queued, uploading, processing, published, failed
  required_scopes text[] default '{}',
  capability_snapshot jsonb default '{}'::jsonb,
  error_message text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists publication_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  video_asset_id uuid references video_assets(id) on delete cascade,
  media_item_id uuid references media_items(id) on delete set null,
  platform text not null,
  social_account_target_id uuid,
  status text default 'queued', -- queued, processing, success, failed, retrying, dead_letter
  priority int default 100,
  attempts int default 0,
  max_attempts int default 4,
  next_run_at timestamptz default now(),
  payload jsonb default '{}'::jsonb,
  result jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Commerce, payments, receivables and commissions ---------------------------
create table if not exists sales_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  bling_order_id text,
  gateway_order_id text,
  gateway_charge_id text,
  live_session_id uuid references live_sessions(id) on delete set null,
  media_item_id uuid references media_items(id) on delete set null,
  affiliate_id uuid,
  click_id uuid,
  origin_channel text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  customer_name text,
  customer_email text,
  customer_phone text,
  gross_amount numeric not null default 0,
  discount_amount numeric default 0,
  shipping_amount numeric default 0,
  gateway_fee_amount numeric default 0,
  net_amount numeric,
  payment_status text default 'pending', -- pending, paid, failed, refunded, chargeback
  order_status text default 'created', -- created, processing, invoiced, shipped, delivered, canceled
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sales_order_id uuid not null references sales_orders(id) on delete cascade,
  bling_product_id text not null,
  product_id uuid references products(id) on delete set null,
  sku text,
  name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  product_snapshot jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sales_order_id uuid references sales_orders(id) on delete set null,
  provider text not null, -- pagarme, stripe, manual
  provider_payment_id text,
  provider_charge_id text,
  method text, -- pix, card, boleto, wallet
  status text default 'pending',
  amount numeric not null default 0,
  currency text default 'BRL',
  raw jsonb default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, provider_payment_id)
);

create table if not exists receivables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sales_order_id uuid references sales_orders(id) on delete set null,
  payment_id uuid references payments(id) on delete set null,
  gateway text not null,
  gateway_receivable_id text,
  recipient_id text,
  gross_amount numeric not null default 0,
  fee_amount numeric default 0,
  net_amount numeric not null default 0,
  status text not null default 'pending', -- pending, available, paid, canceled, refunded
  expected_payment_date date,
  paid_at timestamptz,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  affiliate_id uuid not null,
  sales_order_id uuid references sales_orders(id) on delete cascade,
  media_item_id uuid references media_items(id) on delete set null,
  live_session_id uuid references live_sessions(id) on delete set null,
  commission_type text default 'percent',
  commission_rate numeric,
  commission_amount numeric not null default 0,
  status text default 'pending', -- pending, approved, payable, paid, canceled
  payable_at date,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications --------------------------------------------------------------
create table if not exists notification_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid,
  expo_push_token text not null,
  platform text not null, -- ios, android, web
  device_id text,
  app_version text,
  is_active boolean default true,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(expo_push_token)
);

create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid not null,
  live_reminders boolean default true,
  product_offers boolean default true,
  affiliate_alerts boolean default true,
  order_updates boolean default true,
  sales_alerts boolean default true,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, user_id)
);

create table if not exists live_subscribers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid,
  anonymous_id text,
  live_session_id uuid not null references live_sessions(id) on delete cascade,
  bling_product_id text,
  notify_30_min_before boolean default true,
  notify_10_min_before boolean default true,
  notify_when_live boolean default true,
  created_at timestamptz default now()
);

create table if not exists notification_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null,
  target_type text not null, -- audience, affiliate, seller, admin
  live_session_id uuid references live_sessions(id) on delete cascade,
  media_item_id uuid references media_items(id) on delete set null,
  bling_product_id text,
  affiliate_id uuid,
  title text not null,
  body text not null,
  deep_link text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text default 'scheduled', -- scheduled, sending, sent, failed, canceled
  attempts int default 0,
  max_attempts int default 4,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  notification_job_id uuid references notification_jobs(id) on delete set null,
  user_id uuid,
  event_type text not null, -- sent, delivered, opened, clicked, failed
  live_session_id uuid references live_sessions(id) on delete set null,
  media_item_id uuid references media_items(id) on delete set null,
  bling_product_id text,
  affiliate_id uuid,
  click_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Operational logs -----------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  actor_type text default 'user', -- user, system, worker, platform_admin, mcp
  action text not null,
  entity_type text,
  entity_id uuid,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists job_queue_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  job_type text not null,
  job_id uuid,
  status text not null,
  attempts int default 0,
  error_message text,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  provider text not null,
  sync_type text not null,
  status text not null,
  records_processed int default 0,
  records_failed int default 0,
  error_message text,
  safe_metadata jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists error_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  severity text default 'error',
  source text not null,
  code text,
  message text not null,
  entity_type text,
  entity_id uuid,
  safe_metadata jsonb default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists publication_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  publication_job_id uuid references publication_jobs(id) on delete set null,
  video_publication_id uuid references video_publications(id) on delete set null,
  platform text,
  status text not null,
  message text,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Indexes -------------------------------------------------------------------
create index if not exists idx_bling_channels_tenant_platform on bling_channels(tenant_id, platform);
create index if not exists idx_product_images_tenant_bling on product_images(tenant_id, bling_product_id);
create index if not exists idx_video_assets_tenant_status on video_assets(tenant_id, status);
create index if not exists idx_video_publications_tenant_platform_status on video_publications(tenant_id, platform, publish_status);
create index if not exists idx_publication_jobs_next_run on publication_jobs(status, next_run_at);
create index if not exists idx_sales_orders_tenant_created on sales_orders(tenant_id, created_at desc);
create index if not exists idx_sales_orders_tracking on sales_orders(tenant_id, media_item_id, affiliate_id, click_id);
create index if not exists idx_receivables_tenant_status_date on receivables(tenant_id, status, expected_payment_date);
create index if not exists idx_notification_jobs_due on notification_jobs(status, scheduled_at);
create index if not exists idx_audit_logs_tenant_created on audit_logs(tenant_id, created_at desc);
create index if not exists idx_error_events_tenant_created on error_events(tenant_id, created_at desc);

-- RLS enable ----------------------------------------------------------------
alter table bling_connections enable row level security;
alter table bling_channels enable row level security;
alter table product_images enable row level security;
alter table product_channel_map enable row level security;
alter table video_assets enable row level security;
alter table video_publications enable row level security;
alter table publication_jobs enable row level security;
alter table sales_orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table receivables enable row level security;
alter table affiliate_commissions enable row level security;
alter table notification_tokens enable row level security;
alter table notification_preferences enable row level security;
alter table live_subscribers enable row level security;
alter table notification_jobs enable row level security;
alter table notification_events enable row level security;
alter table audit_logs enable row level security;
alter table job_queue_logs enable row level security;
alter table sync_logs enable row level security;
alter table error_events enable row level security;
alter table publication_logs enable row level security;
