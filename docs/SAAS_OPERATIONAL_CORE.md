# SaaS Operational Core

This module turns LiveShop from a functional app into a full SaaS platform.

## Added product layers

1. Guided onboarding wizard.
2. SaaS billing plans, limits and usage events.
3. Super admin console.
4. Roles and permissions for tenant teams.
5. Feature flags for gradual rollout.
6. LGPD/privacy controls.
7. Built-in support center.
8. App Store and Google Play readiness.
9. Nuvemshop-style storefront templates.
10. Error recovery center.
11. Optional AI Commerce Copilot.

## Non-negotiable design rule

Do not implement these as UI-only features. Each must be backed by Supabase tables, RLS, audit logs and server-side checks where applicable.

## SaaS activation funnel

`account_created -> tenant_created -> branding_done -> bling_connected -> products_synced -> payment_connected -> first_media_created -> first_sale`

## Required metrics

- Time to first product synced.
- Time to first shoppable media item.
- Time to first sale.
- Integration failure rate.
- Autopost failure rate.
- Domain activation time.
- Push opt-in rate.
- Trial to paid conversion.
