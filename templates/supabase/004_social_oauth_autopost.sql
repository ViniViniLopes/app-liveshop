-- 004_social_oauth_autopost.sql
-- Tenant-scoped social OAuth and autopost authorization model.

create table if not exists public.social_oauth_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid not null,
  platform text not null,
  state_hash text not null,
  pkce_code_verifier_encrypted text,
  pkce_code_challenge text,
  requested_scopes text[] not null default '{}',
  redirect_uri text not null,
  return_deep_link text,
  status text not null default 'pending', -- pending, completed, expired, failed, canceled
  error_message text,
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid not null,
  platform text not null, -- youtube, meta, facebook, instagram, tiktok, pinterest, linkedin, x
  platform_account_id text not null,
  account_name text,
  account_username text,
  account_avatar_url text,
  account_type text, -- user, channel, page, business, creator, organization
  status text not null default 'connected', -- connected, reconnect_required, disconnected, revoked, disabled
  granted_scopes text[] not null default '{}',
  expires_at timestamptz,
  last_refresh_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, platform, platform_account_id)
);

create table if not exists public.social_account_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  token_type text not null, -- user, page, target, refresh
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_secret_encrypted text,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'active', -- active, expired, revoked, invalid
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_account_targets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform text not null,
  target_type text not null, -- youtube_channel, facebook_page, instagram_business, tiktok_profile, pinterest_board, linkedin_member, linkedin_organization, x_user
  external_target_id text not null,
  target_name text,
  target_username text,
  target_avatar_url text,
  parent_external_id text,
  is_default boolean not null default false,
  status text not null default 'active', -- active, disabled, reconnect_required
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, platform, target_type, external_target_id)
);

create table if not exists public.social_account_capabilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  social_account_target_id uuid not null references public.social_account_targets(id) on delete cascade,
  can_publish_video boolean not null default false,
  can_publish_short boolean not null default false,
  can_publish_reel boolean not null default false,
  can_publish_live boolean not null default false,
  can_publish_story boolean not null default false,
  can_read_insights boolean not null default false,
  can_collect_permalink boolean not null default false,
  requires_manual_fallback boolean not null default false,
  requires_app_review boolean not null default false,
  granted_scopes text[] not null default '{}',
  missing_scopes text[] not null default '{}',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autopost_channel_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  social_account_target_id uuid not null references public.social_account_targets(id) on delete cascade,
  platform text not null,
  enabled boolean not null default false,
  default_privacy text, -- public, unlisted, private, followers, draft
  default_caption_template text,
  default_hashtags text[] not null default '{}',
  default_board_id text,
  default_category_id text,
  require_manual_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, social_account_target_id)
);

create table if not exists public.social_token_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  event_type text not null, -- connected, refreshed, refresh_failed, revoked, disconnected, scope_changed
  platform text not null,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.social_auth_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid,
  platform text not null,
  action text not null,
  status text not null,
  ip_hash text,
  user_agent_hash text,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Optional extension to existing video_publications table if present.
alter table if exists public.video_publications
  add column if not exists social_account_target_id uuid,
  add column if not exists required_scopes text[] default '{}',
  add column if not exists capability_snapshot jsonb default '{}'::jsonb,
  add column if not exists oauth_status text default 'not_checked';

-- RLS must be enabled in production migrations. Policies depend on the project's auth helper functions.
alter table public.social_oauth_sessions enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_account_tokens enable row level security;
alter table public.social_account_targets enable row level security;
alter table public.social_account_capabilities enable row level security;
alter table public.autopost_channel_configs enable row level security;
alter table public.social_token_events enable row level security;
alter table public.social_auth_audit_logs enable row level security;
