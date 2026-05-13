-- 20260512000006_saas_operational_core.sql
-- SaaS layer: plans, subscriptions, metering, roles/permissions, feature flags,
-- onboarding, storefront templates, LGPD/privacy, support, app store readiness,
-- error recovery and platform admin console.
-- Depends on: 001 (tenants, tenant_members, platform_admin_users)

create extension if not exists pgcrypto;

-- Plans and SaaS billing -------------------------------------------------------
create table if not exists plans (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  name          text not null,
  description   text,
  currency      text default 'BRL',
  monthly_price numeric default 0,
  yearly_price  numeric,
  is_public     boolean default true,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists plan_limits (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid references plans(id) on delete cascade,
  limit_key   text not null,
  limit_value numeric,
  unit        text,
  hard_limit  boolean default true,
  created_at  timestamptz default now(),
  unique(plan_id, limit_key)
);

create table if not exists tenant_subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  tenant_id                 uuid not null references tenants(id) on delete cascade,
  plan_id                   uuid references plans(id),
  provider                  text, -- pagarme, stripe, manual
  provider_customer_id      text,
  provider_subscription_id  text,
  status                    text not null default 'trialing',
  -- trialing, active, past_due, canceled, paused
  trial_ends_at             timestamptz,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  grace_ends_at             timestamptz,
  cancel_at_period_end      boolean default false,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

create table if not exists usage_events (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  user_id     uuid,
  feature_key text not null,
  usage_key   text not null,
  quantity    numeric default 1,
  source_type text,
  source_id   uuid,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

create table if not exists tenant_usage_counters (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  usage_key    text not null,
  period_start date not null,
  period_end   date not null,
  quantity     numeric default 0,
  updated_at   timestamptz default now(),
  unique(tenant_id, usage_key, period_start, period_end)
);

-- Roles and permissions -------------------------------------------------------
create table if not exists permissions (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists role_permissions (
  id             uuid primary key default gen_random_uuid(),
  role           text not null,
  permission_key text not null references permissions(key) on delete cascade,
  created_at     timestamptz default now(),
  unique(role, permission_key)
);

create table if not exists team_invitations (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  invited_email text not null,
  invited_role  text not null,
  invited_by    uuid,
  token_hash    text not null,
  status        text default 'pending', -- pending, accepted, expired, revoked
  expires_at    timestamptz not null,
  accepted_at   timestamptz,
  created_at    timestamptz default now()
);

-- Feature flags ---------------------------------------------------------------
create table if not exists feature_flags (
  id                uuid primary key default gen_random_uuid(),
  key               text unique not null,
  description       text,
  default_enabled   boolean default false,
  rollout_strategy  text default 'off',
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists tenant_feature_flags (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  feature_key text not null references feature_flags(key) on delete cascade,
  enabled     boolean not null,
  reason      text,
  expires_at  timestamptz,
  created_by  uuid,
  created_at  timestamptz default now(),
  unique(tenant_id, feature_key)
);

-- Onboarding wizard -----------------------------------------------------------
create table if not exists onboarding_steps (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  title       text not null,
  description text,
  required    boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create table if not exists tenant_onboarding_progress (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  step_key     text not null references onboarding_steps(key) on delete cascade,
  status       text default 'not_started', -- not_started, in_progress, completed, skipped
  metadata     jsonb default '{}'::jsonb,
  completed_at timestamptz,
  updated_at   timestamptz default now(),
  unique(tenant_id, step_key)
);

create table if not exists demo_store_assets (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  asset_type text not null,
  source_id  uuid,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Storefront templates --------------------------------------------------------
create table if not exists storefront_templates (
  id                   uuid primary key default gen_random_uuid(),
  key                  text unique not null,
  name                 text not null,
  category             text,
  preview_image_url    text,
  default_theme_tokens jsonb default '{}'::jsonb,
  is_active            boolean default true,
  created_at           timestamptz default now()
);

create table if not exists theme_sections (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid references storefront_templates(id) on delete cascade,
  section_key     text not null,
  section_type    text not null,
  schema          jsonb default '{}'::jsonb,
  default_content jsonb default '{}'::jsonb,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  unique(template_id, section_key)
);

create table if not exists tenant_theme_settings (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  template_id      uuid references storefront_templates(id),
  theme_tokens     jsonb default '{}'::jsonb,
  section_overrides jsonb default '{}'::jsonb,
  status           text default 'draft', -- draft, published
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- LGPD / Privacy --------------------------------------------------------------
create table if not exists consent_records (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references tenants(id) on delete cascade,
  user_id       uuid,
  anonymous_id  text,
  consent_type  text not null,
  status        text not null, -- granted, denied, revoked
  version       text,
  source        text,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

create table if not exists privacy_requests (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid references tenants(id) on delete cascade,
  user_id          uuid,
  requester_email  text,
  request_type     text not null, -- export, delete, anonymize, correction
  status           text default 'received', -- received, in_progress, completed, rejected
  due_at           timestamptz,
  completed_at     timestamptz,
  metadata         jsonb default '{}'::jsonb,
  created_at       timestamptz default now()
);

create table if not exists data_retention_policies (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid references tenants(id) on delete cascade,
  data_category        text not null,
  retention_days       int,
  anonymize_after_days int,
  is_active            boolean default true,
  created_at           timestamptz default now(),
  unique(tenant_id, data_category)
);

-- Support center --------------------------------------------------------------
create table if not exists support_tickets (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid references tenants(id) on delete cascade,
  created_by          uuid,
  assigned_to         uuid,
  category            text not null,
  priority            text default 'normal', -- low, normal, high, urgent
  status              text default 'open', -- open, in_progress, resolved, closed
  subject             text not null,
  related_entity_type text,
  related_entity_id   uuid,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists support_messages (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid references support_tickets(id) on delete cascade,
  author_id     uuid,
  author_type   text not null, -- tenant_user, platform_admin, system
  body          text not null,
  internal_only boolean default false,
  attachments   jsonb default '[]'::jsonb,
  created_at    timestamptz default now()
);

create table if not exists help_articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  category     text,
  body_md      text not null,
  is_published boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- App Store readiness ---------------------------------------------------------
create table if not exists app_permission_copy (
  id             uuid primary key default gen_random_uuid(),
  platform       text not null, -- ios, android
  permission_key text not null,
  title          text,
  description    text not null,
  review_note    text,
  is_active      boolean default true,
  created_at     timestamptz default now(),
  unique(platform, permission_key)
);

create table if not exists app_review_checklists (
  id              uuid primary key default gen_random_uuid(),
  release_version text not null,
  platform        text not null,
  checklist       jsonb default '[]'::jsonb,
  status          text default 'draft', -- draft, submitted, approved, rejected
  reviewer_notes  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Error recovery and integration health ---------------------------------------
create table if not exists integration_health (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  integration_key      text not null,
  status               text default 'unknown', -- healthy, degraded, failed, unknown
  last_success_at      timestamptz,
  last_failure_at      timestamptz,
  last_error_code      text,
  last_error_message   text,
  metadata             jsonb default '{}'::jsonb,
  updated_at           timestamptz default now(),
  unique(tenant_id, integration_key)
);

create table if not exists recovery_tasks (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid references tenants(id) on delete cascade,
  source_type        text not null,
  source_id          uuid,
  failure_code       text not null,
  status             text default 'detected',
  -- detected, user_action_required, retrying, resolved, ignored
  user_action_label  text,
  admin_action_label text,
  retry_count        int default 0,
  max_retries        int default 4,
  next_retry_at      timestamptz,
  resolved_at        timestamptz,
  metadata           jsonb default '{}'::jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Indexes
create index if not exists idx_tenant_subscriptions_tenant on tenant_subscriptions(tenant_id, status);
create index if not exists idx_usage_events_tenant_key on usage_events(tenant_id, usage_key, created_at desc);
create index if not exists idx_tenant_feature_flags_tenant on tenant_feature_flags(tenant_id, feature_key);
create index if not exists idx_tenant_onboarding_tenant on tenant_onboarding_progress(tenant_id, status);
create index if not exists idx_support_tickets_tenant on support_tickets(tenant_id, status, created_at desc);
create index if not exists idx_integration_health_tenant on integration_health(tenant_id, integration_key);
create index if not exists idx_recovery_tasks_tenant on recovery_tasks(tenant_id, status, created_at desc);

-- RLS
alter table plans                      enable row level security;
alter table plan_limits                enable row level security;
alter table tenant_subscriptions       enable row level security;
alter table usage_events               enable row level security;
alter table tenant_usage_counters      enable row level security;
alter table permissions                enable row level security;
alter table role_permissions           enable row level security;
alter table team_invitations           enable row level security;
alter table feature_flags              enable row level security;
alter table tenant_feature_flags       enable row level security;
alter table onboarding_steps           enable row level security;
alter table tenant_onboarding_progress enable row level security;
alter table demo_store_assets          enable row level security;
alter table storefront_templates       enable row level security;
alter table theme_sections             enable row level security;
alter table tenant_theme_settings      enable row level security;
alter table consent_records            enable row level security;
alter table privacy_requests           enable row level security;
alter table data_retention_policies    enable row level security;
alter table support_tickets            enable row level security;
alter table support_messages           enable row level security;
alter table help_articles              enable row level security;
alter table app_permission_copy        enable row level security;
alter table app_review_checklists      enable row level security;
alter table integration_health         enable row level security;
alter table recovery_tasks             enable row level security;

-- Public read (global/platform tables)
create policy plans_public_read on plans for select using (is_public = true and is_active = true);
create policy plan_limits_public_read on plan_limits for select using (true);
create policy feature_flags_public_read on feature_flags for select using (is_active = true);
create policy onboarding_steps_public_read on onboarding_steps for select using (true);
create policy storefront_templates_public_read on storefront_templates for select using (is_active = true);
create policy theme_sections_public_read on theme_sections for select using (true);
create policy help_articles_public_read on help_articles for select using (is_published = true);
create policy permissions_public_read on permissions for select using (true);
create policy role_permissions_public_read on role_permissions for select using (true);
create policy app_permission_copy_public_read on app_permission_copy for select using (is_active = true);

-- Tenant-scoped read/write
create policy tenant_subscriptions_member on tenant_subscriptions for select using (public.is_tenant_member(tenant_id));
create policy usage_events_member on usage_events for select using (public.is_tenant_member(tenant_id));
create policy usage_counters_member on tenant_usage_counters for select using (public.is_tenant_member(tenant_id));
create policy feature_flags_tenant_member on tenant_feature_flags for select using (public.is_tenant_member(tenant_id));
create policy onboarding_progress_member on tenant_onboarding_progress for select using (public.is_tenant_member(tenant_id));
create policy onboarding_progress_admin on tenant_onboarding_progress for all using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));
create policy theme_settings_member on tenant_theme_settings for select using (public.is_tenant_member(tenant_id));
create policy theme_settings_admin on tenant_theme_settings for all using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));
create policy support_tickets_member on support_tickets for select using (public.is_tenant_member(tenant_id) or created_by = auth.uid());
create policy support_tickets_insert on support_tickets for insert with check (public.is_tenant_member(tenant_id));
create policy integration_health_member on integration_health for select using (public.is_tenant_member(tenant_id));
create policy recovery_tasks_member on recovery_tasks for select using (public.is_tenant_member(tenant_id));
create policy consent_records_own on consent_records for select using (user_id = auth.uid() or public.is_platform_admin());
create policy consent_records_insert on consent_records for insert with check (true);

-- Seed essential data ---------------------------------------------------------
insert into feature_flags(key, description, default_enabled) values
  ('enable_live_studio',             'Mobile live studio + RTMPS',             false),
  ('enable_youtube_live',            'YouTube live creation',                   false),
  ('enable_facebook_live',           'Facebook live creation',                  false),
  ('enable_autopost_youtube',        'YouTube autopost',                        false),
  ('enable_autopost_instagram',      'Instagram autopost',                      false),
  ('enable_autopost_tiktok',         'TikTok autopost',                         false),
  ('enable_custom_domain',           'Custom domains',                          false),
  ('enable_cloudflare_managed_dns',  'Cloudflare managed DNS',                  false),
  ('enable_affiliates',              'Affiliate system',                        true),
  ('enable_push_notifications',      'Push notification campaigns',             false),
  ('enable_ai_caption_generator',    'AI-assisted captions',                    false),
  ('enable_demo_store',              'Demo store generation',                   true)
on conflict(key) do nothing;

insert into onboarding_steps(key,title,description,required,sort_order) values
  ('create_store',      'Criar loja',            'Crie a identidade da sua loja',                         true,  10),
  ('brand_store',       'Personalizar marca',    'Faça upload do logo e escolha as cores',                true,  20),
  ('setup_domain',      'Configurar domínio',    'Use subdomínio padrão ou conecte domínio customizado',  false, 30),
  ('connect_bling',     'Conectar Bling',        'Conecte o ERP e sincronize os produtos',                true,  40),
  ('connect_payment',   'Configurar pagamento',  'Ative o checkout (Pagar.me ou sandbox)',                 true,  50),
  ('connect_social',    'Contas sociais',        'Habilite autopost/live nos canais',                     false, 60),
  ('create_first_media','Primeiro vídeo/live',   'Publique o primeiro item shoppable',                    true,  70),
  ('share_storefront',  'Compartilhar vitrine',  'Gere link de afiliado ou compartilhamento',             false, 80)
on conflict(key) do nothing;

insert into storefront_templates(key,name,category,default_theme_tokens) values
  ('fashion',     'Fashion',     'fashion',     '{"radius":"xl","card":"floating","style":"editorial"}'::jsonb),
  ('beauty',      'Beauty',      'beauty',      '{"radius":"2xl","card":"soft","style":"premium"}'::jsonb),
  ('food',        'Food',        'food',        '{"radius":"lg","card":"warm","style":"appetizing"}'::jsonb),
  ('electronics', 'Electronics', 'electronics', '{"radius":"md","card":"sharp","style":"tech"}'::jsonb),
  ('minimal',     'Minimal',     'general',     '{"radius":"md","card":"clean","style":"minimal"}'::jsonb),
  ('neon',        'Neon Live',   'live',        '{"radius":"2xl","card":"neon","style":"social-video","accent":"#A3FF00"}'::jsonb),
  ('premium',     'Premium',     'luxury',      '{"radius":"xl","card":"glass","style":"luxury"}'::jsonb)
on conflict(key) do nothing;
