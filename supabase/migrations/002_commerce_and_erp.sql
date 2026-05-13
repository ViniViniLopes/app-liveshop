-- 002_commerce_and_erp.sql
-- Products, Bling, Sales, and Affiliates

-- 1. ERP Connections
create table if not exists bling_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  access_token_vault_id uuid, -- Reference to Vault
  refresh_token_vault_id uuid,
  expires_at timestamptz,
  status text default 'active',
  created_at timestamptz default now(),
  unique (tenant_id)
);

create table if not exists bling_channels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  bling_id text not null,
  name text,
  type text,
  created_at timestamptz default now()
);

-- 2. Products
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
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, bling_product_id)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  bling_product_id text not null,
  url text not null,
  position int default 0,
  created_at timestamptz default now()
);

-- 3. Sales
create table if not exists sales_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid,
  bling_order_id text,
  total_amount numeric not null,
  status text not null default 'pending',
  media_item_id uuid,
  click_id uuid,
  utm_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_id uuid not null references sales_orders(id) on delete cascade,
  bling_product_id text not null,
  quantity int not null,
  unit_price numeric not null,
  created_at timestamptz default now()
);

-- 4. Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_id uuid not null references sales_orders(id),
  gateway text not null,
  external_id text,
  amount numeric not null,
  status text not null default 'pending',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists receivables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  payment_id uuid not null references payments(id),
  amount numeric not null,
  due_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 5. Affiliates
create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  affiliate_id uuid not null,
  media_item_id uuid,
  bling_product_id text,
  code text not null unique,
  destination_url text not null,
  created_at timestamptz default now()
);

create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  affiliate_link_id uuid references affiliate_links(id),
  affiliate_id uuid,
  click_id uuid default gen_random_uuid(),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz default now()
);

create table if not exists affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_id uuid not null references sales_orders(id),
  affiliate_id uuid not null,
  amount numeric not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 6. Enable RLS
alter table bling_connections enable row level security;
alter table bling_channels enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table sales_orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table receivables enable row level security;
alter table affiliate_links enable row level security;
alter table affiliate_clicks enable row level security;
alter table affiliate_commissions enable row level security;

-- 7. Policies
create policy bling_connections_admin_only on bling_connections
  for all using (public.is_platform_admin());

create policy products_select on products
  for select using (public.is_tenant_member(tenant_id));

create policy products_admin_manage on products
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy sales_orders_select on sales_orders
  for select using (public.is_tenant_member(tenant_id));

create policy sales_orders_admin_manage on sales_orders
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']));

-- (Add other policies following same pattern)
