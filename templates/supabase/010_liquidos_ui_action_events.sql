-- LiveShop LiquidOS UI Action Events

create table if not exists public.ui_action_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid,
  anonymous_id text,
  media_item_id uuid,
  live_session_id uuid,
  bling_product_id text,
  affiliate_id uuid,
  click_id uuid,
  action_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ui_action_events_tenant_created on public.ui_action_events(tenant_id, created_at desc);
create index if not exists idx_ui_action_events_media on public.ui_action_events(media_item_id);
create index if not exists idx_ui_action_events_live on public.ui_action_events(live_session_id);
create index if not exists idx_ui_action_events_product on public.ui_action_events(bling_product_id);
create index if not exists idx_ui_action_events_action_type on public.ui_action_events(action_type);

alter table public.ui_action_events enable row level security;

-- Policies assume helper functions from 008_rls_alignment_and_helpers.sql exist.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ui_action_events' and policyname = 'tenant members can read ui action events'
  ) then
    create policy "tenant members can read ui action events"
      on public.ui_action_events for select
      using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ui_action_events' and policyname = 'authenticated users can insert own tenant ui action events'
  ) then
    create policy "authenticated users can insert own tenant ui action events"
      on public.ui_action_events for insert
      with check (public.is_tenant_member(tenant_id));
  end if;
end $$;
