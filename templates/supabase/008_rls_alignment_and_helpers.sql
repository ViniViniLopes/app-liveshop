-- 008_rls_alignment_and_helpers.sql
-- Adds RLS helper functions and baseline tenant-isolation policies.
-- Service-role workers bypass RLS for server-side jobs, but client access stays isolated.

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

-- Tenant members table policies ---------------------------------------------
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_members' and policyname='tenant_members_read_own') then
    create policy tenant_members_read_own on tenant_members
      for select using (user_id = auth.uid() or public.is_platform_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_members' and policyname='tenant_members_owner_manage') then
    create policy tenant_members_owner_manage on tenant_members
      for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
      with check (public.has_tenant_role(tenant_id, array['owner','admin']));
  end if;
end $$;

-- Generic tenant-scoped read/write policies ---------------------------------
do $$
declare
  t text;
  read_tables text[] := array[
    'products','product_images','product_channel_map','bling_channels','tenant_branding','tenant_domains','storefront_theme_versions','brand_assets','domain_verification_events',
    'cloudflare_zones','cloudflare_dns_records','domain_dns_checks','media_items','live_sessions','live_products','video_assets','video_publications',
    'affiliate_links','affiliate_clicks','sales_orders','order_items','receivables','affiliate_commissions','notification_preferences','live_subscribers','notification_jobs','notification_events',
    'tenant_subscriptions','usage_events','tenant_usage_counters','tenant_feature_flags','tenant_onboarding_progress','demo_store_assets','tenant_theme_settings','consent_records','privacy_requests','data_retention_policies','support_tickets','integration_health','recovery_tasks','ui_action_events','stitch_design_references','animation_presets','ui_button_configs','audit_logs','job_queue_logs','sync_logs','error_events','publication_logs'
  ];
  admin_tables text[] := array[
    'products','product_images','product_channel_map','bling_channels','tenant_branding','tenant_domains','storefront_theme_versions','brand_assets','domain_verification_events',
    'cloudflare_zones','cloudflare_dns_records','domain_dns_checks','media_items','live_sessions','live_products','video_assets','video_publications','publication_jobs',
    'affiliate_links','sales_orders','order_items','receivables','affiliate_commissions','notification_jobs','tenant_feature_flags','tenant_theme_settings','support_tickets','integration_health','recovery_tasks','ui_button_configs'
  ];
begin
  foreach t in array read_tables loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='tenant_member_select') then
        execute format('create policy tenant_member_select on public.%I for select using (public.is_tenant_member(tenant_id))', t);
      end if;
    end if;
  end loop;

  foreach t in array admin_tables loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='tenant_admin_manage') then
        execute format('create policy tenant_admin_manage on public.%I for all using (public.has_tenant_role(tenant_id, array[''owner'',''admin''])) with check (public.has_tenant_role(tenant_id, array[''owner'',''admin'']))', t);
      end if;
    end if;
  end loop;
end $$;

-- Highly sensitive token/provider tables: platform admin only from client side.
-- Backend workers should use service role / secret refs.
do $$
declare
  t text;
  sensitive_tables text[] := array[
    'bling_connections','payments','notification_tokens','social_oauth_sessions','social_accounts','social_account_tokens','social_account_targets','social_account_capabilities','autopost_channel_configs','social_token_events','social_auth_audit_logs','cloudflare_accounts'
  ];
begin
  foreach t in array sensitive_tables loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='platform_admin_only') then
        execute format('create policy platform_admin_only on public.%I for all using (public.is_platform_admin()) with check (public.is_platform_admin())', t);
      end if;
    end if;
  end loop;
end $$;

-- Global public-readable configuration tables.
do $$
declare
  t text;
  global_tables text[] := array['plans','plan_limits','feature_flags','onboarding_steps','storefront_templates','theme_sections','help_articles','component_registry','animation_presets','app_permission_copy'];
begin
  foreach t in array global_tables loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='public_read') then
        execute format('create policy public_read on public.%I for select using (true)', t);
      end if;
    end if;
  end loop;
end $$;

-- Anonymous/public storefront should be served through backend route handlers,
-- not by direct unrestricted table access. Use service role server-side for public pages.
