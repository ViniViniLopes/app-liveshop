-- LiveShop v6 SaaS Operational Core
-- Adds onboarding, SaaS billing, super admin, roles/permissions, feature flags,
-- LGPD/privacy, support center, app store readiness, storefront templates and error recovery.

create extension if not exists pgcrypto;

-- Plans and SaaS billing -----------------------------------------------------
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  currency text default 'BRL',
  monthly_price numeric default 0,
  yearly_price numeric,
  is_public boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists plan_limits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  limit_key text not null,
  limit_value numeric,
  unit text,
  hard_limit boolean default true,
  created_at timestamptz default now(),
  unique(plan_id, limit_key)
);

create table if not exists tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  plan_id uuid references plans(id),
  provider text, -- pagarme, stripe, manual
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid,
  feature_key text not null,
  usage_key text not null,
  quantity numeric default 1,
  source_type text,
  source_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists tenant_usage_counters (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  usage_key text not null,
  period_start date not null,
  period_end date not null,
  quantity numeric default 0,
  updated_at timestamptz default now(),
  unique(tenant_id, usage_key, period_start, period_end)
);

-- Roles and permissions ------------------------------------------------------
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  permission_key text not null references permissions(key) on delete cascade,
  created_at timestamptz default now(),
  unique(role, permission_key)
);

create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  invited_email text not null,
  invited_role text not null,
  invited_by uuid,
  token_hash text not null,
  status text default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- Feature flags --------------------------------------------------------------
create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  default_enabled boolean default false,
  rollout_strategy text default 'off',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tenant_feature_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  feature_key text not null references feature_flags(key) on delete cascade,
  enabled boolean not null,
  reason text,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz default now(),
  unique(tenant_id, feature_key)
);

-- Onboarding and demo mode ---------------------------------------------------
create table if not exists onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text,
  required boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists tenant_onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  step_key text not null references onboarding_steps(key) on delete cascade,
  status text default 'not_started',
  metadata jsonb default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(tenant_id, step_key)
);

create table if not exists demo_store_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  asset_type text not null,
  source_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Storefront templates -------------------------------------------------------
create table if not exists storefront_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  category text,
  preview_image_url text,
  default_theme_tokens jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists theme_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references storefront_templates(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  schema jsonb default '{}'::jsonb,
  default_content jsonb default '{}'::jsonb,
  sort_order int default 0,
  created_at timestamptz default now(),
  unique(template_id, section_key)
);

create table if not exists tenant_theme_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  template_id uuid references storefront_templates(id),
  theme_tokens jsonb default '{}'::jsonb,
  section_overrides jsonb default '{}'::jsonb,
  status text default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Privacy, consent and LGPD --------------------------------------------------
create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  anonymous_id text,
  consent_type text not null,
  status text not null, -- granted, denied, revoked
  version text,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists privacy_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  requester_email text,
  request_type text not null, -- export, delete, anonymize, correction
  status text default 'received',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  data_category text not null,
  retention_days int,
  anonymize_after_days int,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(tenant_id, data_category)
);

-- Support center -------------------------------------------------------------
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  created_by uuid,
  assigned_to uuid,
  category text not null,
  priority text default 'normal',
  status text default 'open',
  subject text not null,
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references support_tickets(id) on delete cascade,
  author_id uuid,
  author_type text not null, -- tenant_user, platform_admin, system
  body text not null,
  internal_only boolean default false,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  body_md text not null,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- App store readiness --------------------------------------------------------
create table if not exists app_permission_copy (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- ios, android
  permission_key text not null,
  title text,
  description text not null,
  review_note text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(platform, permission_key)
);

create table if not exists app_review_checklists (
  id uuid primary key default gen_random_uuid(),
  release_version text not null,
  platform text not null,
  checklist jsonb default '[]'::jsonb,
  status text default 'draft',
  reviewer_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Error recovery and integration health -------------------------------------
create table if not exists integration_health (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  integration_key text not null,
  status text default 'unknown',
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error_code text,
  last_error_message text,
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique(tenant_id, integration_key)
);

create table if not exists recovery_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  source_type text not null,
  source_id uuid,
  failure_code text not null,
  status text default 'detected',
  user_action_label text,
  admin_action_label text,
  retry_count int default 0,
  max_retries int default 4,
  next_retry_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Platform admin -------------------------------------------------------------
create table if not exists platform_admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null default 'support',
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Seed core flags/steps/templates/permissions -------------------------------
insert into feature_flags(key, description, default_enabled) values
('enable_live_studio','Allow mobile live studio creation and RTMPS streaming',false),
('enable_youtube_live','Allow YouTube live creation',false),
('enable_facebook_live','Allow Facebook live creation',false),
('enable_autopost_youtube','Allow YouTube autopost',false),
('enable_autopost_instagram','Allow Instagram autopost',false),
('enable_autopost_tiktok','Allow TikTok autopost where approved',false),
('enable_custom_domain','Allow custom domains',false),
('enable_cloudflare_managed_dns','Allow Cloudflare managed DNS',false),
('enable_affiliates','Allow affiliate system',true),
('enable_push_notifications','Allow push notification campaigns',false),
('enable_ai_caption_generator','Allow AI-assisted captions',false),
('enable_demo_store','Allow demo store generation',true)
on conflict(key) do nothing;

insert into onboarding_steps(key,title,description,required,sort_order) values
('create_store','Create store','Create the tenant/store identity',true,10),
('brand_store','Brand store','Upload logo and choose theme colors',true,20),
('setup_domain','Setup domain','Use default subdomain or connect custom domain',false,30),
('connect_bling','Connect Bling','Connect ERP and sync products',true,40),
('connect_payment','Connect payment','Enable checkout provider or sandbox',true,50),
('connect_social','Connect social accounts','Enable autopost/live channels',false,60),
('create_first_media','Create first video/live','Publish first shoppable media item',true,70),
('share_storefront','Share storefront','Generate affiliate/share link',false,80)
on conflict(key) do nothing;

insert into storefront_templates(key,name,category,default_theme_tokens) values
('fashion','Fashion','fashion','{"radius":"xl","card":"floating","style":"editorial"}'::jsonb),
('beauty','Beauty','beauty','{"radius":"2xl","card":"soft","style":"premium"}'::jsonb),
('food','Food','food','{"radius":"lg","card":"warm","style":"appetizing"}'::jsonb),
('electronics','Electronics','electronics','{"radius":"md","card":"sharp","style":"tech"}'::jsonb),
('minimal','Minimal','general','{"radius":"md","card":"clean","style":"minimal"}'::jsonb),
('neon','Neon','live','{"radius":"2xl","card":"neon","style":"social-video"}'::jsonb),
('premium','Premium','luxury','{"radius":"xl","card":"glass","style":"luxury"}'::jsonb)
on conflict(key) do nothing;
