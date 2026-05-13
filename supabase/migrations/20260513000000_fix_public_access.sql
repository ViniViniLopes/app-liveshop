-- Fix RLS for Public Access
-- This migration allows public (non-authenticated or non-member) users 
-- to view products and live sessions for the storefront.

-- 1. Products
drop policy if exists products_select on products;
create policy products_public_select on products
  for select using (status = 'active');

-- 2. Media Items (Live Drops)
drop policy if exists media_items_select on media_items;
create policy media_items_public_select on media_items
  for select using (is_active = true);

-- 3. Live Sessions
drop policy if exists live_sessions_select on live_sessions;
create policy live_sessions_public_select on live_sessions
  for select using (true);

-- 4. Tenants (Storefront branding)
drop policy if exists tenants_read_member on tenants;
create policy tenants_public_read on tenants
  for select using (true);
