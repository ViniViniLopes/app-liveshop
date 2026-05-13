/**
 * LiveShop Database Types
 * Generated manually from migrations 001–008.
 * Replace with `supabase gen types typescript` when Supabase CLI is configured.
 */

// ── Shared primitives ────────────────────────────────────────────────────────
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UUID = string;
export type Timestamptz = string;

// ── 001: Core Foundation ─────────────────────────────────────────────────────
export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  branding: Json;
  settings: Json;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface TenantMember {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  role: TenantMemberRole;
  created_at: Timestamptz;
}

export type TenantMemberRole =
  | 'owner'
  | 'admin'
  | 'seller'
  | 'live_host'
  | 'affiliate'
  | 'affiliate_manager'
  | 'finance'
  | 'viewer'
  | 'support';

export interface PlatformAdminUser {
  id: UUID;
  user_id: UUID;
  is_active: boolean;
  created_at: Timestamptz;
}

export interface TenantDomain {
  id: UUID;
  tenant_id: UUID;
  hostname: string;
  is_verified: boolean;
  dns_provider: string | null;
  status: DomainStatus;
  // Extended in 002
  domain: string | null;
  normalized_domain: string | null;
  domain_type: string | null;
  verification_method: string | null;
  verification_token: string | null;
  verification_record_name: string | null;
  verification_record_value: string | null;
  dns_target: string | null;
  ssl_status: string | null;
  is_primary: boolean;
  last_checked_at: Timestamptz | null;
  verified_at: Timestamptz | null;
  activated_at: Timestamptz | null;
  // Extended in 003
  cloudflare_zone_id: string | null;
  cloudflare_account_id_ref: string | null;
  dns_status: string | null;
  routing_status: string | null;
  last_dns_check_at: Timestamptz | null;
  last_ssl_check_at: Timestamptz | null;
  last_route_check_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed' | 'disabled';

// ── 002: Tenant Branding & Domains ───────────────────────────────────────────
export interface TenantBranding {
  tenant_id: UUID;
  store_name: string;
  store_description: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  button_radius: string;
  card_radius: string;
  font_family: string;
  theme_tokens: Json;
  custom_css: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  is_published: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface BrandAsset {
  id: UUID;
  tenant_id: UUID;
  asset_type: 'logo' | 'favicon' | 'og_image' | 'banner' | 'product_placeholder';
  storage_path: string;
  public_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  created_by: UUID | null;
  created_at: Timestamptz;
}

// ── 003: Cloudflare DNS ───────────────────────────────────────────────────────
export interface CloudflareZone {
  id: UUID;
  tenant_id: UUID;
  domain_id: UUID | null;
  zone_id: string | null;
  root_domain: string;
  zone_name: string;
  status: 'pending' | 'initializing' | 'active' | 'moved' | 'deactivated' | 'failed';
  nameservers: string[] | null;
  original_nameservers: string[] | null;
  last_checked_at: Timestamptz | null;
  activated_at: Timestamptz | null;
  error_message: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

// ── 004: Social OAuth & Autopost ─────────────────────────────────────────────
export type SocialPlatform =
  | 'youtube'
  | 'meta'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'linkedin'
  | 'x';

export interface SocialAccount {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  platform: SocialPlatform;
  platform_account_id: string;
  account_name: string | null;
  account_username: string | null;
  account_avatar_url: string | null;
  account_type: string | null;
  status: 'connected' | 'reconnect_required' | 'disconnected' | 'revoked' | 'disabled';
  granted_scopes: string[];
  expires_at: Timestamptz | null;
  last_refresh_at: Timestamptz | null;
  last_error: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface SocialAccountCapabilities {
  id: UUID;
  tenant_id: UUID;
  social_account_target_id: UUID;
  can_publish_video: boolean;
  can_publish_short: boolean;
  can_publish_reel: boolean;
  can_publish_live: boolean;
  can_publish_story: boolean;
  can_read_insights: boolean;
  can_collect_permalink: boolean;
  requires_manual_fallback: boolean;
  requires_app_review: boolean;
  granted_scopes: string[];
  missing_scopes: string[];
  last_checked_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

// ── 006: SaaS Operational Core ───────────────────────────────────────────────
export interface Plan {
  id: UUID;
  code: string;
  name: string;
  description: string | null;
  currency: string;
  monthly_price: number;
  yearly_price: number | null;
  is_public: boolean;
  is_active: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface TenantSubscription {
  id: UUID;
  tenant_id: UUID;
  plan_id: UUID | null;
  provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
  trial_ends_at: Timestamptz | null;
  current_period_start: Timestamptz | null;
  current_period_end: Timestamptz | null;
  cancel_at_period_end: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface FeatureFlag {
  id: UUID;
  key: string;
  description: string | null;
  default_enabled: boolean;
  rollout_strategy: string;
  is_active: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface TenantFeatureFlag {
  id: UUID;
  tenant_id: UUID;
  feature_key: string;
  enabled: boolean;
  reason: string | null;
  expires_at: Timestamptz | null;
  created_by: UUID | null;
  created_at: Timestamptz;
}

export interface StorefrontTemplate {
  id: UUID;
  key: string;
  name: string;
  category: string | null;
  preview_image_url: string | null;
  default_theme_tokens: Json;
  is_active: boolean;
  created_at: Timestamptz;
}

export interface IntegrationHealth {
  id: UUID;
  tenant_id: UUID;
  integration_key: string;
  status: 'healthy' | 'degraded' | 'failed' | 'unknown';
  last_success_at: Timestamptz | null;
  last_failure_at: Timestamptz | null;
  last_error_code: string | null;
  last_error_message: string | null;
  metadata: Json;
  updated_at: Timestamptz;
}

// ── 007: Commerce, Media, Notifications ──────────────────────────────────────
export interface Product {
  id: UUID;
  tenant_id: UUID;
  bling_product_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  status: 'active' | 'inactive' | 'discontinued';
  raw_bling_data: Json;
  last_synced_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface MediaItem {
  id: UUID;
  tenant_id: UUID;
  created_by: UUID | null;
  type: 'recorded_video' | 'live' | 'replay' | 'external_post';
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  bling_product_id: string | null;
  product_id: UUID | null;
  affiliate_link: string | null;
  status: 'draft' | 'scheduled' | 'live' | 'published' | 'archived';
  published_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface LiveSession {
  id: UUID;
  tenant_id: UUID;
  media_item_id: UUID | null;
  created_by: UUID | null;
  title: string;
  description: string | null;
  scheduled_at: Timestamptz | null;
  started_at: Timestamptz | null;
  ended_at: Timestamptz | null;
  status: 'scheduled' | 'live' | 'ended' | 'canceled' | 'replay_ready';
  platform: 'youtube' | 'facebook' | 'both' | null;
  stream_key_ref: string | null; // Vault reference only
  youtube_stream_id: string | null;
  facebook_stream_id: string | null;
  replay_url: string | null;
  peak_viewers: number | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface AffiliateLink {
  id: UUID;
  tenant_id: UUID;
  affiliate_id: UUID;
  media_item_id: UUID | null;
  live_session_id: UUID | null;
  bling_product_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  short_code: string | null;
  destination_url: string;
  click_count: number;
  is_active: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface AffiliateClick {
  id: UUID;
  tenant_id: UUID;
  affiliate_link_id: UUID | null;
  affiliate_id: UUID | null;
  click_id: UUID;
  media_item_id: UUID | null;
  bling_product_id: string | null;
  ip_hash: string | null;
  user_agent_hash: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  converted: boolean;
  converted_at: Timestamptz | null;
  created_at: Timestamptz;
}

export interface SalesOrder {
  id: UUID;
  tenant_id: UUID;
  bling_order_id: string | null;
  gateway_order_id: string | null;
  gateway_charge_id: string | null;
  live_session_id: UUID | null;
  media_item_id: UUID | null;
  affiliate_id: UUID | null;
  click_id: UUID | null;
  origin_channel: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  gross_amount: number;
  discount_amount: number;
  shipping_amount: number;
  gateway_fee_amount: number;
  net_amount: number | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'chargeback';
  order_status: 'created' | 'processing' | 'invoiced' | 'shipped' | 'delivered' | 'canceled';
  paid_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Payment {
  id: UUID;
  tenant_id: UUID;
  sales_order_id: UUID | null;
  provider: 'pagarme' | 'stripe' | 'manual';
  provider_payment_id: string | null;
  provider_charge_id: string | null;
  method: 'pix' | 'card' | 'boleto' | 'wallet' | null;
  status: string;
  amount: number;
  currency: string;
  raw: Json;
  paid_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface NotificationJob {
  id: UUID;
  tenant_id: UUID;
  type: string;
  target_type: 'audience' | 'affiliate' | 'seller' | 'admin';
  live_session_id: UUID | null;
  media_item_id: UUID | null;
  bling_product_id: string | null;
  affiliate_id: UUID | null;
  title: string;
  body: string;
  deep_link: string | null;
  scheduled_at: Timestamptz | null;
  sent_at: Timestamptz | null;
  status: 'scheduled' | 'sending' | 'sent' | 'failed' | 'canceled';
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface AuditLog {
  id: UUID;
  tenant_id: UUID | null;
  user_id: UUID | null;
  actor_type: 'user' | 'system' | 'worker' | 'platform_admin' | 'mcp';
  action: string;
  entity_type: string | null;
  entity_id: UUID | null;
  safe_metadata: Json;
  created_at: Timestamptz;
}

export interface ErrorEvent {
  id: UUID;
  tenant_id: UUID | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  code: string | null;
  message: string;
  entity_type: string | null;
  entity_id: UUID | null;
  safe_metadata: Json;
  resolved_at: Timestamptz | null;
  created_at: Timestamptz;
}

// ── Database shape for Supabase client typing ─────────────────────────────────
export interface Database {
  public: {
    Tables: {
      tenants:                    { Row: Tenant;              Insert: Partial<Tenant>;              Update: Partial<Tenant>              };
      tenant_members:             { Row: TenantMember;        Insert: Partial<TenantMember>;        Update: Partial<TenantMember>        };
      tenant_domains:             { Row: TenantDomain;        Insert: Partial<TenantDomain>;        Update: Partial<TenantDomain>        };
      tenant_branding:            { Row: TenantBranding;      Insert: Partial<TenantBranding>;      Update: Partial<TenantBranding>      };
      platform_admin_users:       { Row: PlatformAdminUser;   Insert: Partial<PlatformAdminUser>;   Update: Partial<PlatformAdminUser>   };
      products:                   { Row: Product;             Insert: Partial<Product>;             Update: Partial<Product>             };
      media_items:                { Row: MediaItem;           Insert: Partial<MediaItem>;           Update: Partial<MediaItem>           };
      live_sessions:              { Row: LiveSession;         Insert: Partial<LiveSession>;         Update: Partial<LiveSession>         };
      affiliate_links:            { Row: AffiliateLink;       Insert: Partial<AffiliateLink>;       Update: Partial<AffiliateLink>       };
      affiliate_clicks:           { Row: AffiliateClick;      Insert: Partial<AffiliateClick>;      Update: Partial<AffiliateClick>      };
      sales_orders:               { Row: SalesOrder;          Insert: Partial<SalesOrder>;          Update: Partial<SalesOrder>          };
      payments:                   { Row: Payment;             Insert: Partial<Payment>;             Update: Partial<Payment>             };
      notification_jobs:          { Row: NotificationJob;     Insert: Partial<NotificationJob>;     Update: Partial<NotificationJob>     };
      audit_logs:                 { Row: AuditLog;            Insert: Partial<AuditLog>;            Update: Partial<AuditLog>            };
      error_events:               { Row: ErrorEvent;          Insert: Partial<ErrorEvent>;          Update: Partial<ErrorEvent>          };
      plans:                      { Row: Plan;                Insert: Partial<Plan>;                Update: Partial<Plan>                };
      tenant_subscriptions:       { Row: TenantSubscription;  Insert: Partial<TenantSubscription>;  Update: Partial<TenantSubscription>  };
      feature_flags:              { Row: FeatureFlag;         Insert: Partial<FeatureFlag>;         Update: Partial<FeatureFlag>         };
      tenant_feature_flags:       { Row: TenantFeatureFlag;   Insert: Partial<TenantFeatureFlag>;   Update: Partial<TenantFeatureFlag>   };
      storefront_templates:       { Row: StorefrontTemplate;  Insert: Partial<StorefrontTemplate>;  Update: Partial<StorefrontTemplate>  };
      integration_health:         { Row: IntegrationHealth;   Insert: Partial<IntegrationHealth>;   Update: Partial<IntegrationHealth>   };
      social_accounts:            { Row: SocialAccount;       Insert: Partial<SocialAccount>;       Update: Partial<SocialAccount>       };
      social_account_capabilities:{ Row: SocialAccountCapabilities; Insert: Partial<SocialAccountCapabilities>; Update: Partial<SocialAccountCapabilities> };
      cloudflare_zones:           { Row: CloudflareZone;      Insert: Partial<CloudflareZone>;      Update: Partial<CloudflareZone>      };
    };
    Functions: {
      is_platform_admin:   { Args: Record<string, never>; Returns: boolean };
      is_tenant_member:    { Args: { p_tenant_id: string }; Returns: boolean };
      has_tenant_role:     { Args: { p_tenant_id: string; p_roles: string[] }; Returns: boolean };
      caller_tenant_id:    { Args: Record<string, never>; Returns: string };
    };
  };
}
