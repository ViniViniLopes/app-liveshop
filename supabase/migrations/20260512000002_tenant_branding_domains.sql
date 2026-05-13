-- 20260512000002_tenant_branding_domains.sql
-- LiveShop tenant branding, white-label domains and theme management.
-- Depends on: 20260512000001_core_foundation (tenants, tenant_members, tenant_domains, helpers)

-- Extend tenant_domains with branding-specific columns (safe - idempotent)
alter table tenant_domains
  add column if not exists domain           text,
  add column if not exists normalized_domain text,
  add column if not exists domain_type       text not null default 'custom',
  add column if not exists verification_method text default 'txt',
  add column if not exists verification_token  text default encode(gen_random_bytes(24), 'hex'),
  add column if not exists verification_record_name  text,
  add column if not exists verification_record_value text,
  add column if not exists dns_target        text,
  add column if not exists ssl_status        text default 'pending',
  add column if not exists is_primary        boolean default false,
  add column if not exists last_checked_at   timestamptz,
  add column if not exists verified_at       timestamptz,
  add column if not exists activated_at      timestamptz;

-- Tenant branding (logo, colors, SEO, theme tokens)
create table if not exists tenant_branding (
  tenant_id uuid primary key references tenants(id) on delete cascade,

  store_name        text not null,
  store_description text,
  logo_url          text,
  logo_dark_url     text,
  favicon_url       text,
  og_image_url      text,

  primary_color     text default '#111827',
  secondary_color   text default '#ffffff',
  accent_color      text default '#A3FF00',
  background_color  text default '#0a0a0a',
  text_color        text default '#f9fafb',
  button_radius     text default '14px',
  card_radius       text default '18px',
  font_family       text default 'Inter',

  theme_tokens      jsonb default '{}'::jsonb,
  custom_css        text,

  seo_title         text,
  seo_description   text,
  seo_keywords      text[],

  is_published      boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Storefront theme version history
create table if not exists storefront_theme_versions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  version_name    text not null,
  theme_tokens    jsonb not null default '{}'::jsonb,
  preview_image_url text,
  status          text default 'draft', -- draft, published, archived
  created_by      uuid,
  published_at    timestamptz,
  created_at      timestamptz default now()
);

-- Brand asset storage references
create table if not exists brand_assets (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  asset_type   text not null, -- logo, favicon, og_image, banner, product_placeholder
  storage_path text not null,
  public_url   text,
  mime_type    text,
  size_bytes   int,
  width        int,
  height       int,
  created_by   uuid,
  created_at   timestamptz default now()
);

-- Domain verification event log
create table if not exists domain_verification_events (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  tenant_domain_id uuid not null references tenant_domains(id) on delete cascade,
  event_type       text not null, -- created, dns_checked, verified, activated, failed, disabled
  details          jsonb default '{}'::jsonb,
  created_by       uuid,
  created_at       timestamptz default now()
);

-- Indexes
create index if not exists idx_tenant_branding_published on tenant_branding(is_published) where is_published = true;
create index if not exists idx_storefront_theme_versions_tenant on storefront_theme_versions(tenant_id, status);
create index if not exists idx_brand_assets_tenant on brand_assets(tenant_id, asset_type);
create index if not exists idx_domain_verification_events_domain on domain_verification_events(tenant_domain_id, created_at desc);

-- RLS
alter table tenant_branding             enable row level security;
alter table storefront_theme_versions   enable row level security;
alter table brand_assets                enable row level security;
alter table domain_verification_events  enable row level security;

-- Policies using helpers from 001
create policy branding_member_select on tenant_branding
  for select using (public.is_tenant_member(tenant_id));

create policy branding_admin_manage on tenant_branding
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy theme_versions_member_select on storefront_theme_versions
  for select using (public.is_tenant_member(tenant_id));

create policy theme_versions_admin_manage on storefront_theme_versions
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy brand_assets_member_select on brand_assets
  for select using (public.is_tenant_member(tenant_id));

create policy brand_assets_admin_manage on brand_assets
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy domain_events_member_select on domain_verification_events
  for select using (public.is_tenant_member(tenant_id));

create policy domain_events_admin_manage on domain_verification_events
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));
