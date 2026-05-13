# LiveShop Architecture

## Runtime split

- Vercel: `apps/web` Next.js storefront, dashboard, checkout and public routes.
- Supabase: Auth, Postgres, RLS, Realtime, Edge Functions, Cron, Queues, Vault.
- Hetzner Docker: workers, MCP, n8n, Redis/Valkey, observability.
- Mobile: React Native + Expo Development Build + native RTMPS bridge.
- Video: direct mobile RTMPS to YouTube/Facebook.

## Why hybrid

Vercel is best for frontend speed and DX. Hetzner is best for long-running workers and cost control. Supabase is the operational data brain. YouTube/Facebook eliminate live video infrastructure cost.
