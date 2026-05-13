-- 20260512000005_stitch_ui_interactions.sql
-- Design references, component registry, animation presets and UI action event tracking.
-- Depends on: 001 (tenants, tenant_members, helpers)

-- Stitch design reference registry
create table if not exists stitch_design_references (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid references tenants(id) on delete cascade,
  -- null = platform-level reference

  name               text not null,
  screen_key         text not null,
  source_type        text not null check (source_type in ('stitch_export','screenshot','reference_image','manual_spec')),
  file_url           text,
  prompt             text,
  exported_code_path text,
  notes              text,
  created_by         uuid,
  created_at         timestamptz default now()
);

-- Component registry (maps screen_key to package path)
create table if not exists component_registry (
  id                    uuid primary key default gen_random_uuid(),
  component_key         text not null unique,
  platform              text not null check (platform in ('web','mobile','shared')),
  package_path          text not null,
  description           text,
  accepts_tenant_theme  boolean default true,
  requires_tracking     boolean default false,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Animation presets (reusable across components)
create table if not exists animation_presets (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  preset_key  text not null,
  platform    text not null check (platform in ('web','mobile','shared')),
  config      jsonb not null default '{}'::jsonb,
  is_default  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(tenant_id, preset_key, platform)
);

-- Button/action config (maps button to tracked action type)
create table if not exists ui_button_configs (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid references tenants(id) on delete cascade,
  component_key         text not null,
  action_type           text not null,
  label                 text not null,
  variant               text default 'primary',
  requires_auth         boolean default false,
  requires_confirmation boolean default false,
  enabled               boolean default true,
  config                jsonb not null default '{}'::jsonb,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- UI action events (storefront analytics — all IDs for attribution)
create table if not exists ui_action_events (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  user_id         uuid,
  anonymous_id    text,
  session_id      text,
  action_type     text not null,
  component_key   text,
  media_item_id   uuid,
  live_session_id uuid,
  video_asset_id  uuid,
  bling_product_id text,
  affiliate_id    uuid,
  click_id        uuid,
  order_id        uuid,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz default now()
);

-- Indexes
create index if not exists idx_ui_action_events_tenant_type on ui_action_events(tenant_id, action_type, created_at desc);
create index if not exists idx_ui_action_events_media on ui_action_events(tenant_id, media_item_id) where media_item_id is not null;
create index if not exists idx_stitch_refs_screen_key on stitch_design_references(screen_key);
create index if not exists idx_animation_presets_tenant on animation_presets(tenant_id, platform);

-- RLS
alter table stitch_design_references enable row level security;
alter table component_registry        enable row level security;
alter table animation_presets         enable row level security;
alter table ui_button_configs         enable row level security;
alter table ui_action_events          enable row level security;

-- Design references: platform admin manages, members can read
create policy stitch_refs_member_select on stitch_design_references
  for select using (tenant_id is null or public.is_tenant_member(tenant_id));

create policy stitch_refs_admin_manage on stitch_design_references
  for all using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Component registry: public read (platform-level)
create policy component_registry_public_read on component_registry
  for select using (true);

-- Animation presets: member read
create policy animation_presets_member_select on animation_presets
  for select using (tenant_id is null or public.is_tenant_member(tenant_id));

-- Button configs: member read, admin manage
create policy ui_button_configs_member_select on ui_button_configs
  for select using (tenant_id is null or public.is_tenant_member(tenant_id));

-- UI action events: tenants insert their own, read own
create policy ui_action_events_member_select on ui_action_events
  for select using (public.is_tenant_member(tenant_id));

create policy ui_action_events_insert on ui_action_events
  for insert with check (public.is_tenant_member(tenant_id));
