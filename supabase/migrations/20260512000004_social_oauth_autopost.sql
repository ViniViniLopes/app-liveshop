-- 20260512000004_social_oauth_autopost.sql
-- Social OAuth sessions, accounts, tokens, targets, capabilities and autopost config.
-- Tokens are NEVER stored raw — only encrypted secret refs (Supabase Vault).
-- Depends on: 001 (tenants, tenant_members)

-- OAuth session state (server-side only, short-lived)
create table if not exists social_oauth_sessions (
  id                           uuid primary key default gen_random_uuid(),
  tenant_id                    uuid not null references tenants(id) on delete cascade,
  user_id                      uuid not null,
  platform                     text not null,
  state_hash                   text not null,
  pkce_code_verifier_encrypted text,
  pkce_code_challenge          text,
  requested_scopes             text[] not null default '{}',
  redirect_uri                 text not null,
  return_deep_link             text,
  status                       text not null default 'pending',
  -- pending, completed, expired, failed, canceled
  error_message                text,
  expires_at                   timestamptz not null,
  completed_at                 timestamptz,
  created_at                   timestamptz not null default now()
);

-- Connected social accounts per tenant/user
create table if not exists social_accounts (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id) on delete cascade,
  user_id               uuid not null,
  platform              text not null,
  -- youtube, meta, facebook, instagram, tiktok, pinterest, linkedin, x
  platform_account_id   text not null,
  account_name          text,
  account_username      text,
  account_avatar_url    text,
  account_type          text,
  -- user, channel, page, business, creator, organization
  status                text not null default 'connected',
  -- connected, reconnect_required, disconnected, revoked, disabled
  granted_scopes        text[] not null default '{}',
  expires_at            timestamptz,
  last_refresh_at       timestamptz,
  last_error            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique(tenant_id, platform, platform_account_id)
);

-- Encrypted token storage — platform admin + service role only
create table if not exists social_account_tokens (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references tenants(id) on delete cascade,
  social_account_id        uuid not null references social_accounts(id) on delete cascade,
  token_type               text not null, -- user, page, target, refresh
  access_token_encrypted   text,
  refresh_token_encrypted  text,
  token_secret_encrypted   text,
  expires_at               timestamptz,
  scopes                   text[] not null default '{}',
  status                   text not null default 'active',
  -- active, expired, revoked, invalid
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Publishable targets (channel, page, profile) within a social account
create table if not exists social_account_targets (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  social_account_id   uuid not null references social_accounts(id) on delete cascade,
  platform            text not null,
  target_type         text not null,
  -- youtube_channel, facebook_page, instagram_business, tiktok_profile,
  -- pinterest_board, linkedin_member, linkedin_organization, x_user
  external_target_id  text not null,
  target_name         text,
  target_username     text,
  target_avatar_url   text,
  parent_external_id  text,
  is_default          boolean not null default false,
  status              text not null default 'active',
  -- active, disabled, reconnect_required
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(tenant_id, platform, target_type, external_target_id)
);

-- What a target can actually do (check before creating autopost jobs)
create table if not exists social_account_capabilities (
  id                         uuid primary key default gen_random_uuid(),
  tenant_id                  uuid not null references tenants(id) on delete cascade,
  social_account_target_id   uuid not null references social_account_targets(id) on delete cascade,
  can_publish_video          boolean not null default false,
  can_publish_short          boolean not null default false,
  can_publish_reel           boolean not null default false,
  can_publish_live           boolean not null default false,
  can_publish_story          boolean not null default false,
  can_read_insights          boolean not null default false,
  can_collect_permalink      boolean not null default false,
  requires_manual_fallback   boolean not null default false,
  requires_app_review        boolean not null default false,
  granted_scopes             text[] not null default '{}',
  missing_scopes             text[] not null default '{}',
  last_checked_at            timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- Per-target autopost configuration
create table if not exists autopost_channel_configs (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references tenants(id) on delete cascade,
  social_account_target_id uuid not null references social_account_targets(id) on delete cascade,
  platform                 text not null,
  enabled                  boolean not null default false,
  default_privacy          text, -- public, unlisted, private, followers, draft
  default_caption_template text,
  default_hashtags         text[] not null default '{}',
  default_board_id         text,
  default_category_id      text,
  require_manual_approval  boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique(tenant_id, social_account_target_id)
);

-- Token lifecycle event log (no raw tokens, safe metadata only)
create table if not exists social_token_events (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  social_account_id uuid references social_accounts(id) on delete set null,
  event_type        text not null,
  -- connected, refreshed, refresh_failed, revoked, disconnected, scope_changed
  platform          text not null,
  safe_metadata     jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

-- Social auth audit log (no PII, hashed IPs only)
create table if not exists social_auth_audit_logs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  user_id         uuid,
  platform        text not null,
  action          text not null,
  status          text not null,
  ip_hash         text,
  user_agent_hash text,
  safe_metadata   jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_social_accounts_tenant_platform on social_accounts(tenant_id, platform, status);
create index if not exists idx_social_account_targets_account on social_account_targets(social_account_id, status);
create index if not exists idx_social_oauth_sessions_state on social_oauth_sessions(state_hash, status);
create index if not exists idx_social_token_events_tenant on social_token_events(tenant_id, created_at desc);

-- RLS
alter table social_oauth_sessions        enable row level security;
alter table social_accounts              enable row level security;
alter table social_account_tokens        enable row level security;
alter table social_account_targets       enable row level security;
alter table social_account_capabilities  enable row level security;
alter table autopost_channel_configs     enable row level security;
alter table social_token_events          enable row level security;
alter table social_auth_audit_logs       enable row level security;

-- OAuth sessions: user sees only their own
create policy social_oauth_sessions_own on social_oauth_sessions
  for select using (user_id = auth.uid() or public.is_platform_admin());

-- Social accounts: member read, admin manage
create policy social_accounts_member_select on social_accounts
  for select using (public.is_tenant_member(tenant_id));

create policy social_accounts_admin_manage on social_accounts
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

-- Tokens: platform admin only from client (workers use service role)
create policy social_tokens_platform_admin on social_account_tokens
  for all using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Targets: member read, admin manage
create policy social_targets_member_select on social_account_targets
  for select using (public.is_tenant_member(tenant_id));

create policy social_targets_admin_manage on social_account_targets
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

-- Capabilities: member read
create policy social_caps_member_select on social_account_capabilities
  for select using (public.is_tenant_member(tenant_id));

-- Autopost configs: admin manage
create policy autopost_configs_admin_manage on autopost_channel_configs
  for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
  with check (public.has_tenant_role(tenant_id, array['owner','admin']));

-- Token events: member read
create policy social_token_events_member_select on social_token_events
  for select using (public.is_tenant_member(tenant_id));

-- Auth audit: platform admin only
create policy social_auth_audit_platform_admin on social_auth_audit_logs
  for all using (public.is_platform_admin())
  with check (public.is_platform_admin());
