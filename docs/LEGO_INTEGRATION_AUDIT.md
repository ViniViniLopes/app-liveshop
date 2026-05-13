# LiveShop Lego Integration Audit — v7

Status: **architecturally coherent after v7 patch**.

This audit validates whether the main pieces of the LiveShop platform connect through stable IDs, queues, events, data contracts, RLS, and operational fallbacks before Antigravity starts implementation.

## Decision

Use the system as a set of connected contracts, not isolated modules:

- `tenants` / `tenant_members` define ownership and isolation.
- `products` + `bling_product_id` define product truth from Bling.
- `media_items` is the storefront center for recorded videos, live sessions, replays, and external posts.
- `affiliate_clicks.click_id` is the attribution connector.
- `sales_orders` is the commerce connector between checkout, tracking, affiliate, Bling, dashboard, and receivables.
- `notification_jobs` and `publication_jobs` ensure async work and retries.
- `tenant_domains` + Cloudflare/Vercel connect white-label routing.
- `social_account_capabilities` prevents assuming a network can autopost/live when it cannot.

## Findings fixed in v7

1. Added missing commerce tables: `sales_orders`, `order_items`, `payments`, `receivables`, `affiliate_commissions`.
2. Added missing notification tables: `notification_tokens`, `notification_preferences`, `live_subscribers`, `notification_jobs`, `notification_events`.
3. Added missing media publication/job tables: `video_assets`, `video_publications`, `publication_jobs`.
4. Added missing Bling operational tables: `bling_connections`, `bling_channels`, `product_images`, `product_channel_map`.
5. Added operational logs: `audit_logs`, `job_queue_logs`, `sync_logs`, `error_events`, `publication_logs`.
6. Fixed naming mismatch: Cloudflare RLS policies now use `tenant_members`, not `tenant_users`.
7. Expanded `tenant_members.role` to include SaaS operational roles such as `live_host`, `affiliate_manager`, and `finance`.
8. Added RLS helper functions and baseline policies.

## Remaining implementation risks

These are not schema blockers, but must be handled during development:

- Social APIs require app review/scopes. Always check `social_account_capabilities` before creating autopost jobs.
- Mobile RTMPS must be implemented as native modules, not as Expo Go-only code.
- Webhooks must be idempotent and saved before processing.
- Public storefront should resolve tenant by Host header, never by client-provided tenant_id.
- Token tables must never be readable by mobile/web clients.

## Required Antigravity behavior

Before implementing any feature, Antigravity must answer:

1. Which tenant boundary is used?
2. Which IDs connect the flow?
3. Which table is the source of truth?
4. Which job/event is created?
5. Which retry/fallback exists?
6. Which RLS policy protects it?
7. Which dashboard/log proves it worked?

