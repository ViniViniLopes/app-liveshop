-- LiveShop Cloudflare DNS white-label support
-- Add this after 001_core_schema.sql and 002_tenant_branding_domains.sql

create table if not exists cloudflare_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,

  mode text not null default 'platform_managed',
  -- platform_managed: LiveShop central Cloudflare account
  -- tenant_managed: tenant provided a scoped Cloudflare token
  -- manual_external: tenant uses another DNS provider/manual DNS

  cloudflare_account_id text,
  account_name text,
  api_token_secret_ref text,
  -- Secret reference only. Do not store raw tokens here.

  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cloudflare_zones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  domain_id uuid references tenant_domains(id) on delete cascade,
  cloudflare_account_ref uuid references cloudflare_accounts(id) on delete set null,

  zone_id text,
  root_domain text not null,
  zone_name text not null,
  status text not null default 'pending',
  -- pending, initializing, active, moved, deactivated, failed

  nameservers text[],
  original_nameservers text[],

  last_checked_at timestamptz,
  activated_at timestamptz,
  error_message text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(tenant_id, root_domain)
);

create table if not exists cloudflare_dns_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  domain_id uuid references tenant_domains(id) on delete cascade,
  cloudflare_zone_ref uuid references cloudflare_zones(id) on delete cascade,

  cloudflare_record_id text,
  record_type text not null,
  record_name text not null,
  record_content text not null,
  proxied boolean default false,
  ttl int default 1,

  purpose text not null,
  -- storefront_route, domain_verification, email, api, misc

  status text not null default 'pending',
  -- pending, active, update_required, failed, deleted

  last_checked_at timestamptz,
  error_message text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(tenant_id, record_name, record_type, purpose)
);

create table if not exists domain_dns_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  domain_id uuid references tenant_domains(id) on delete cascade,

  check_type text not null,
  -- txt_verification, cname_target, apex_target, nameserver, ssl, http_route

  expected_value text,
  observed_value text,
  status text not null default 'pending',
  checked_at timestamptz default now(),
  error_message text,

  created_at timestamptz default now()
);

alter table tenant_domains
  add column if not exists dns_provider text default 'cloudflare_managed',
  add column if not exists cloudflare_zone_id text,
  add column if not exists cloudflare_account_id text,
  add column if not exists dns_status text default 'pending',
  add column if not exists ssl_status text default 'pending',
  add column if not exists routing_status text default 'pending',
  add column if not exists verification_token text,
  add column if not exists verification_record_name text default '_liveshop-verify',
  add column if not exists verification_record_value text,
  add column if not exists last_dns_check_at timestamptz,
  add column if not exists last_ssl_check_at timestamptz,
  add column if not exists last_route_check_at timestamptz;

alter table cloudflare_accounts enable row level security;
alter table cloudflare_zones enable row level security;
alter table cloudflare_dns_records enable row level security;
alter table domain_dns_checks enable row level security;

-- Adjust these policies to your auth schema. They assume a tenant_members table exists.
create policy if not exists cloudflare_accounts_tenant_isolation on cloudflare_accounts
  for all using (
    tenant_id is null or exists (
      select 1 from tenant_members tu
      where tu.tenant_id = cloudflare_accounts.tenant_id
      and tu.user_id = auth.uid()
    )
  );

create policy if not exists cloudflare_zones_tenant_isolation on cloudflare_zones
  for all using (
    exists (
      select 1 from tenant_members tu
      where tu.tenant_id = cloudflare_zones.tenant_id
      and tu.user_id = auth.uid()
    )
  );

create policy if not exists cloudflare_dns_records_tenant_isolation on cloudflare_dns_records
  for all using (
    exists (
      select 1 from tenant_members tu
      where tu.tenant_id = cloudflare_dns_records.tenant_id
      and tu.user_id = auth.uid()
    )
  );

create policy if not exists domain_dns_checks_tenant_isolation on domain_dns_checks
  for all using (
    exists (
      select 1 from tenant_members tu
      where tu.tenant_id = domain_dns_checks.tenant_id
      and tu.user_id = auth.uid()
    )
  );
