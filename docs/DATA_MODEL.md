# Data Model Spec — LiveShop Platform

This document outlines the core schema structure and key relationships.

## Core Schema (Supabase / Postgres)

### 1. Identity & Tenants
- **`tenants`**: `id`, `slug`, `name`, `branding` (JSON), `settings` (JSON).
- **`tenant_members`**: `id`, `tenant_id`, `user_id`, `role` (super_admin, live_host, affiliate_manager, etc.).
- **`tenant_domains`**: `id`, `tenant_id`, `hostname`, `status` (pending, active), `dns_provider` (cloudflare, manual).

### 2. Products (Bling Cache)
- **`products`**: `id` (bling_product_id), `tenant_id`, `sku`, `title`, `description`, `price`, `stock`, `product_snapshot` (JSONB).
- **`product_images`**: `id`, `bling_product_id`, `url`, `position`.

### 3. Storefront Nucleus (Media)
- **`media_items`**: `id`, `tenant_id`, `type` (recorded_video, live, replay, external_post), `title`, `description`, `bling_product_id` (binding), `asset_id` (ref to video_assets/live_sessions), `is_active`.
- **`video_assets`**: `id`, `tenant_id`, `storage_url`, `thumbnail_url`, `duration`, `metadata`.
- **`live_sessions`**: `id`, `tenant_id`, `status` (scheduled, live, ended), `stream_key_id` (ref to Vault), `embed_url`, `started_at`, `ended_at`.

### 4. Commerce & Sales
- **`sales_orders`**: `id`, `tenant_id`, `customer_id`, `bling_order_id`, `total_amount`, `status`, `media_item_id`, `click_id`, `utm_metadata` (JSONB).
- **`payments`**: `id`, `order_id`, `gateway` (pagar.me, stripe), `external_id`, `status`, `amount`.
- **`affiliate_clicks`**: `id`, `tenant_id`, `affiliate_id`, `media_item_id`, `click_metadata` (JSONB).
- **`affiliate_commissions`**: `id`, `order_id`, `affiliate_id`, `amount`, `status`.

### 5. Automation & Notifications
- **`notification_tokens`**: `id`, `user_id`, `token`, `platform` (ios, android, web), `is_active`. (Opt-in/Opt-out logic).
- **`notification_jobs`**: `id`, `tenant_id`, `type`, `status`, `scheduled_at`, `retry_count`.
- **`ui_action_events`**: `id`, `tenant_id`, `action_type`, `user_id`, `media_item_id`, `metadata`.

### 6. Logging & Audit
- **`audit_logs`**: `id`, `tenant_id`, `user_id`, `action`, `entity_type`, `entity_id`.
- **`job_queue_logs`**: `id`, `job_id`, `status`, `error_message`, `payload`.

## RLS Rules
- **Policy**: `tenant_id = (select auth.jwt() ->> 'tenant_id')` or via `tenant_members` join.
- **Bypass**: ONLY allowed for internal workers using `service_role` (Hetzner).
