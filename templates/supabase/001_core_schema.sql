-- LiveShop core schema starter
-- Review with data-model-migration-specialist and security-gate before applying.

create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','seller','affiliate','viewer','support')),
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  bling_product_id text not null,
  sku text,
  name text not null,
  description text,
  price numeric,
  stock numeric default 0,
  main_image_url text,
  status text default 'active',
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, bling_product_id)
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null check (type in ('recorded_video','live','replay','external_post')),
  status text not null default 'draft',
  title text not null,
  description text,
  caption text,
  thumbnail_url text,
  platform text,
  source_url text,
  embed_url text,
  public_url text,
  live_session_id uuid,
  video_asset_id uuid,
  bling_product_id text not null,
  sku text,
  product_snapshot jsonb not null default '{}'::jsonb,
  primary_tracking_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists live_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  platform text not null,
  status text not null default 'scheduled',
  title text not null,
  description text,
  platform_broadcast_id text,
  platform_stream_id text,
  ingest_url text,
  stream_key text,
  full_ingest_url text,
  public_url text,
  embed_url text,
  featured_bling_product_id text,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists live_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  live_session_id uuid not null references live_sessions(id) on delete cascade,
  bling_product_id text not null,
  sku text,
  position int,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  affiliate_id uuid not null,
  media_item_id uuid references media_items(id),
  bling_product_id text,
  code text not null unique,
  destination_url text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz default now()
);

create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  affiliate_link_id uuid references affiliate_links(id),
  affiliate_id uuid,
  media_item_id uuid,
  bling_product_id text,
  click_id uuid default gen_random_uuid(),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  user_agent_hash text,
  ip_hash text,
  created_at timestamptz default now()
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  provider text not null,
  event_type text not null,
  external_event_id text,
  payload jsonb not null,
  status text default 'received',
  processed_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_products_tenant_bling on products(tenant_id, bling_product_id);
create index if not exists idx_media_items_tenant_type_status on media_items(tenant_id, type, status);
create index if not exists idx_live_sessions_tenant_status on live_sessions(tenant_id, status);
create index if not exists idx_affiliate_clicks_tenant_affiliate on affiliate_clicks(tenant_id, affiliate_id, created_at);
create index if not exists idx_webhook_events_provider_external on webhook_events(provider, external_event_id);

alter table tenants enable row level security;
alter table tenant_members enable row level security;
alter table products enable row level security;
alter table media_items enable row level security;
alter table live_sessions enable row level security;
alter table live_products enable row level security;
alter table affiliate_links enable row level security;
alter table affiliate_clicks enable row level security;
alter table webhook_events enable row level security;
