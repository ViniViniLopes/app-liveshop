-- LiveShop tenant branding and custom domains
-- This migration adds Nuvemshop-like white-label capabilities.

create table if not exists tenant_branding (
  tenant_id uuid primary key references tenants(id) on delete cascade,

  store_name text not null,
  store_description text,
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  og_image_url text,

  primary_color text default '#111827',
  secondary_color text default '#ffffff',
  accent_color text default '#22c55e',
  background_color text default '#ffffff',
  text_color text default '#111827',
  button_radius text default '14px',
  card_radius text default '18px',
  font_family text default 'Inter',

  theme_tokens jsonb default '{}'::jsonb,
  custom_css text,

  seo_title text,
  seo_description text,
  seo_keywords text[],

  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,

  domain text not null,
  normalized_domain text not null,
  domain_type text not null default 'custom', -- default_subdomain, custom_subdomain, apex
  status text not null default 'pending', -- pending, verifying, active, failed, disabled

  verification_method text default 'txt', -- txt, cname, provider
  verification_token text not null default encode(gen_random_bytes(24), 'hex'),
  verification_record_name text,
  verification_record_value text,

  dns_target text,
  ssl_status text default 'pending', -- pending, issued, failed, unknown
  is_primary boolean default false,

  last_checked_at timestamptz,
  verified_at timestamptz,
  activated_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(normalized_domain)
);

create table if not exists storefront_theme_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  version_name text not null,
  theme_tokens jsonb not null default '{}'::jsonb,
  preview_image_url text,
  status text default 'draft', -- draft, published, archived
  created_by uuid,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists brand_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  asset_type text not null, -- logo, favicon, og_image, banner, product_placeholder
  storage_path text not null,
  public_url text,
  mime_type text,
  size_bytes int,
  width int,
  height int,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists domain_verification_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  tenant_domain_id uuid not null references tenant_domains(id) on delete cascade,
  event_type text not null, -- created, dns_checked, verified, activated, failed, disabled
  details jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now()
);

create index if not exists idx_tenant_domains_tenant on tenant_domains(tenant_id);
create index if not exists idx_tenant_domains_normalized on tenant_domains(normalized_domain);
create index if not exists idx_tenant_domains_status on tenant_domains(status);
create index if not exists idx_brand_assets_tenant on brand_assets(tenant_id);

alter table tenant_branding enable row level security;
alter table tenant_domains enable row level security;
alter table storefront_theme_versions enable row level security;
alter table brand_assets enable row level security;
alter table domain_verification_events enable row level security;

-- Replace `auth.jwt() ->> 'tenant_id'` with your final tenant-claim strategy if needed.
create policy "Tenant members can read branding"
  on tenant_branding for select
  using (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant admins can manage branding"
  on tenant_branding for all
  using (tenant_id::text = auth.jwt() ->> 'tenant_id')
  with check (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant members can read domains"
  on tenant_domains for select
  using (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant admins can manage domains"
  on tenant_domains for all
  using (tenant_id::text = auth.jwt() ->> 'tenant_id')
  with check (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant members can read theme versions"
  on storefront_theme_versions for select
  using (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant admins can manage theme versions"
  on storefront_theme_versions for all
  using (tenant_id::text = auth.jwt() ->> 'tenant_id')
  with check (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant members can read brand assets"
  on brand_assets for select
  using (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant admins can manage brand assets"
  on brand_assets for all
  using (tenant_id::text = auth.jwt() ->> 'tenant_id')
  with check (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant members can read domain events"
  on domain_verification_events for select
  using (tenant_id::text = auth.jwt() ->> 'tenant_id');

create policy "Tenant admins can manage domain events"
  on domain_verification_events for all
  using (tenant_id::text = auth.jwt() ->> 'tenant_id')
  with check (tenant_id::text = auth.jwt() ->> 'tenant_id');
