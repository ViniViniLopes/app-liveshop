-- 001_core_foundation.sql
-- LiveShop Core Foundation Migration

create extension if not exists pgcrypto;

-- 1. Identity & Tenants
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  branding jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Members & Roles
create table if not exists tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','seller','affiliate','viewer','support')),
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
);

create table if not exists platform_admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Domains
create table if not exists tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hostname text not null unique,
  is_verified boolean default false,
  dns_provider text default 'manual',
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Auth Helpers
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from platform_admin_users pau
    where pau.user_id = auth.uid()
      and pau.is_active = true
  );
$$;

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from tenant_members tm
    where tm.tenant_id = p_tenant_id
      and tm.user_id = auth.uid()
  ) or public.is_platform_admin();
$$;

create or replace function public.has_tenant_role(p_tenant_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from tenant_members tm
    where tm.tenant_id = p_tenant_id
      and tm.user_id = auth.uid()
      and tm.role = any(p_roles)
  ) or public.is_platform_admin();
$$;

-- 5. Enable RLS
alter table tenants enable row level security;
alter table tenant_members enable row level security;
alter table platform_admin_users enable row level security;
alter table tenant_domains enable row level security;

-- 6. Basic Policies
create policy tenant_members_read_own on tenant_members
  for select using (user_id = auth.uid() or public.is_platform_admin());

create policy tenant_members_owner_manage on tenant_members
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy tenants_read_member on tenants
  for select using (public.is_tenant_member(id));

create policy tenants_owner_manage on tenants
  for update using (public.has_tenant_role(id, array['owner','admin']));

create policy tenant_domains_select on tenant_domains
  for select using (public.is_tenant_member(tenant_id));

create policy tenant_domains_admin_manage on tenant_domains
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']));
