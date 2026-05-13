-- 005_stitch_ui_interactions.sql
-- Design references, component registry, animations and tracked UI actions.

create table if not exists stitch_design_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  name text not null,
  screen_key text not null,
  source_type text not null check (source_type in ('stitch_export','screenshot','reference_image','manual_spec')),
  file_url text,
  prompt text,
  exported_code_path text,
  notes text,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists component_registry (
  id uuid primary key default gen_random_uuid(),
  component_key text not null unique,
  platform text not null check (platform in ('web','mobile','shared')),
  package_path text not null,
  description text,
  accepts_tenant_theme boolean default true,
  requires_tracking boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists animation_presets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  preset_key text not null,
  platform text not null check (platform in ('web','mobile','shared')),
  config jsonb not null default '{}'::jsonb,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, preset_key, platform)
);

create table if not exists ui_button_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  component_key text not null,
  action_type text not null,
  label text not null,
  variant text default 'primary',
  requires_auth boolean default false,
  requires_confirmation boolean default false,
  enabled boolean default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ui_action_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid,
  anonymous_id text,
  session_id text,
  action_type text not null,
  component_key text,
  media_item_id uuid,
  live_session_id uuid,
  video_asset_id uuid,
  bling_product_id text,
  affiliate_id uuid,
  click_id uuid,
  order_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table stitch_design_references enable row level security;
alter table component_registry enable row level security;
alter table animation_presets enable row level security;
alter table ui_button_configs enable row level security;
alter table ui_action_events enable row level security;

-- Policies must be adjusted to the final auth helper functions created in 001_core_tenants.sql.
-- Keep these tables tenant-scoped and never expose cross-tenant action events.
