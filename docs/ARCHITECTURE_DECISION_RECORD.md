# Architecture Decision Record (ADR) — LiveShop Platform

## ADR 001: Core Platform Foundation

### Status
Accepted

### Context
LiveShop is a white-label Live Commerce SaaS platform requiring multi-tenancy, high security, and cross-platform synchronization (Bling ERP, Social Media, Payments).

### Decision
- **Multi-tenancy**: Use a single shared database with a mandatory `tenant_id` column on all sensitive tables and Supabase RLS (Row Level Security).
- **Backend-as-a-Service**: Supabase (Postgres, Auth, Realtime, Edge Functions).
- **Frontend**: Next.js App Router on Vercel for web; React Native/Expo for mobile.
- **Source of Truth (Products)**: Bling ERP v3 via API. Supabase acts as an operational cache.
- **Live Streaming**: Mobile-to-Platform (YouTube/Facebook) via RTMPS. No self-hosted CDN for MVP.
- **Security**: OAuth tokens and secrets stored in Supabase Vault; strictly backend-only access.
- **Design System**: LiquidOS (Design language) and Stitch (Visual input layer).

### Consequences
- Requires strict RLS auditing.
- Frontend never has `service_role` access.
- All product changes must sync from Bling to Supabase before appearing in storefronts.

## ADR 002: White-label Domain Resolution

### Status
Accepted

### Context
Tenants need custom domains and branded storefronts.

### Decision
- Use **Host header resolution** in Next.js middleware and Supabase functions to identify `tenant_id`.
- Automate DNS management using **Cloudflare DNS Free** per tenant.

### Consequences
- Every public request requires a tenant lookup by hostname.
- Caching strategies must be tenant-aware.

## ADR 003: Asynchronous Reliability

### Status
Accepted

### Context
Integrations with ERP, Payments, and Social Media are prone to failure.

### Decision
- **Webhooks**: Must be saved raw before processing; processed idempotently.
- **Jobs**: Every async task (Push, Autopost, Sync) must support retry counts and dead-letter states in `job_queue_logs`.

### Consequences
- Increased database storage for logs.
- Robust error recovery dashboard required in Super Admin console.
