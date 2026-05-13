# Module Boundaries — LiveShop Platform

This document defines the separation of concerns and data boundaries between the core modules of the platform.

## 1. Tenant & Identity Boundary
- **Responsibility**: Auth, roles, permissions, tenant onboarding, branding, and billing.
- **Rules**: 
    - Every row in this boundary MUST have `tenant_id`.
    - `tenant_members` defines access roles.
    - `service_role` is forbidden from client-side code.

## 2. Commerce (Product & ERP) Boundary
- **Responsibility**: Syncing with Bling, product cache, stock management, and categories.
- **Rules**:
    - **Bling is the Source of Truth**.
    - Supabase cache is read-only for public storefronts.
    - Direct calls from Mobile/Web to Bling are FORBIDDEN.

## 3. Media & Storefront (The "Nucleus")
- **Responsibility**: `media_items` (Video, Live, Replay), `video_assets`, and `live_sessions`.
- **Rules**:
    - **`media_items` is the core entity** for the storefront.
    - Every media item must bind to a `bling_product_id`.
    - No self-hosted video CDN; streams go directly to Social Platforms.

## 4. Sales & Tracking Boundary
- **Responsibility**: Checkout, payment webhooks, affiliate clicks, and commissions.
- **Rules**:
    - `sales_orders` must record `click_id` and `media_item_id`.
    - Idempotent processing of payment webhooks is mandatory.

## 5. Operations & Infrastructure Boundary
- **Responsibility**: Cloudflare DNS automation, Job Queues, Autopost workers, and Push notifications.
- **Rules**:
    - Cloudflare API tokens must never leave the backend.
    - Workers (Hetzner) must handle retries and log to `job_queue_logs`.

## 6. Social & OAuth Boundary
- **Responsibility**: OAuth token exchange, social capability discovery, and autopost execution.
- **Rules**:
    - **Social capabilities** must be checked per channel before publishing.
    - OAuth secrets are stored in Supabase Vault.
    - Tokens are NEVER exposed to the Mobile App.
