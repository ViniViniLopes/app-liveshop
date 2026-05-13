-- 20260512000003_cloudflare_dns_whitelabel.sql
-- Cloudflare DNS white-label support: zones, DNS records, check logs.
-- Depends on: 002 (tenant_domains extended)

-- Platform or tenant Cloudflare account references
create table if not exists cloudflare_accounts (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid references tenants(id) on delete cascade,
  -- null = platform account shared for all tenants

  mode                  text not null default 'platform_managed',
  -- platform_managed: LiveShop central Cloudflare account
  -- tenant_managed: tenant provided a scoped token
  -- manual_external: tenant uses another DNS provider

  cloudflare_account_id text,
  account_name          text,
  api_token_secret_ref  text,
  -- Secret reference only (Supabase Vault key). Never store raw token here.

  status                text not null default 'active',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Cloudflare zone per custom domain
create table if not exists cloudflare_zones (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id) on delete cascade,
  domain_id             uuid references tenant_domains(id) on delete cascade,
  cloudflare_account_ref uuid references cloudflare_accounts(id) on delete set null,

  zone_id               text,
  root_domain           text not null,
  zone_name             text not null,
  status                text not null default 'pending',
  -- pending, initializing, active, moved, deactivated, failed

  nameservers           text[],
  original_nameservers  text[],
  last_checked_at       timestamptz,
  activated_at          timestamptz,
  error_message         text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique(tenant_id, root_domain)
);

-- DNS records within a Cloudflare zone
create table if not exists cloudflare_dns_records (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id) on delete cascade,
  domain_id             uuid references tenant_domains(id) on delete cascade,
  cloudflare_zone_ref   uuid references cloudflare_zones(id) on delete cascade,

  cloudflare_record_id  text,
  record_type           text not null,
  record_name           text not null,
  record_content        text not null,
  proxied               boolean default false,
  ttl                   int default 1,

  purpose               text not null,
  -- storefront_route, domain_verification, email, api, misc

  status                text not null default 'pending',
  -- pending, active, update_required, failed, deleted

  last_checked_at       timestamptz,
  error_message         text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique(tenant_id, record_name, record_type, purpose)
);

-- Per-domain DNS/SSL/routing health checks
create table if not exists domain_dns_checks (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  domain_id      uuid references tenant_domains(id) on delete cascade,

  check_type     text not null,
  -- txt_verification, cname_target, apex_target, nameserver, ssl, http_route

  expected_value text,
  observed_value text,
  status         text not null default 'pending',
  checked_at     timestamptz default now(),
  error_message  text,
  created_at     timestamptz default now()
);

-- Extend tenant_domains with Cloudflare-specific tracking columns
alter table tenant_domains
  add column if not exists cloudflare_zone_id        text,
  add column if not exists cloudflare_account_id_ref text,
  add column if not exists dns_status                text default 'pending',
  add column if not exists routing_status            text default 'pending',
  add column if not exists last_dns_check_at         timestamptz,
  add column if not exists last_ssl_check_at         timestamptz,
  add column if not exists last_route_check_at       timestamptz;

-- Indexes
create index if not exists idx_cloudflare_zones_tenant on cloudflare_zones(tenant_id, status);
create index if not exists idx_cloudflare_dns_records_zone on cloudflare_dns_records(cloudflare_zone_ref, status);
create index if not exists idx_domain_dns_checks_domain on domain_dns_checks(domain_id, check_type, checked_at desc);

-- RLS
alter table cloudflare_accounts    enable row level security;
alter table cloudflare_zones       enable row level security;
alter table cloudflare_dns_records enable row level security;
alter table domain_dns_checks      enable row level security;

-- Cloudflare accounts: platform admin only (contain secret refs)
create policy cf_accounts_platform_admin on cloudflare_accounts
  for all using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Zones: tenant members read, admin manage
create policy cf_zones_member_select on cloudflare_zones
  for select using (public.is_tenant_member(tenant_id));

create policy cf_zones_admin_manage on cloudflare_zones
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

-- DNS records: tenant members read, admin manage
create policy cf_dns_records_member_select on cloudflare_dns_records
  for select using (public.is_tenant_member(tenant_id));

create policy cf_dns_records_admin_manage on cloudflare_dns_records
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

-- DNS checks: tenant members read
create policy domain_dns_checks_member_select on domain_dns_checks
  for select using (public.is_tenant_member(tenant_id));

create policy domain_dns_checks_admin_manage on domain_dns_checks
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));
