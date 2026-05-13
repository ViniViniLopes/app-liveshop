# E2E Acceptance Tests — LiveShop Platform

This document defines the high-level test scenarios that must pass before a feature or release is considered "Done".

## 1. Multi-Tenancy Isolation Test
- **Scenario**: Tenant A creates a product. Tenant B attempts to read it via the API.
- **Expected**: API returns 404 or an empty set for Tenant B.
- **Goal**: Validate RLS and tenant boundaries.

## 2. ERP Sync & Storefront Test
- **Scenario**: Update stock for SKU `LS-001` in Bling.
- **Expected**: Supabase `products` table updates via webhook/worker; Storefront UI reflects the new stock in realtime.
- **Goal**: Validate Bling-as-Source-of-Truth and operational cache.

## 3. Affiliate Attribution Flow
- **Scenario**: Customer clicks an affiliate link (`/a/john-doe`), views a `media_item`, and completes a purchase.
- **Expected**: `sales_orders` records `affiliate_id` and `click_id`. `affiliate_commissions` is generated correctly.
- **Goal**: Validate tracking continuity.

## 4. Idempotent Checkout Test
- **Scenario**: Double-click the "Pay Now" button or send the same payment webhook twice.
- **Expected**: Only one `sales_order` and one Bling order are created.
- **Goal**: Validate webhook persistence and idempotency.

## 5. Live-to-Replay Transition
- **Scenario**: End a `live_session` in the mobile app.
- **Expected**: `media_items` status changes to `replay`. Video embed URL remains accessible. Realtime "Live" badge disappears.
- **Goal**: Validate media lifecycle.

## 6. Social Autopost Check
- **Scenario**: Attempt to autopost to a channel with `live-only` capability.
- **Expected**: Platform blocks the job creation and suggests manual upload.
- **Goal**: Validate Capabilities Matrix enforcement.

## 7. White-label Domain Routing
- **Scenario**: Access the storefront via `tenant-a.liveshop.com.br` vs `brand-b.com.br`.
- **Expected**: Each request resolves the correct `tenant_id` and applies the correct branding (Logo/Colors) via host header.
- **Goal**: Validate white-label resolution.
