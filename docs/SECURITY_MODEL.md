# Security Model — LiveShop Platform

This document outlines the strict security rules governing data access, tokens, and multi-tenancy.

## 1. Multi-Tenancy & Isolation
- **RLS Mandatory**: Every table containing tenant data MUST have Row Level Security enabled.
- **Tenant Context**: The `tenant_id` must be extracted from the JWT (provided by Supabase Auth) or resolved via host header for public requests.
- **Cross-tenant Leak Prevention**: Automated tests must attempt to access data using tokens from different tenants.

## 2. Secrets & Token Management
- **Supabase Vault**: All sensitive tokens (Bling API Keys, OAuth Refresh Tokens, Social Client Secrets) MUST be stored in Supabase Vault or an equivalent encrypted storage.
- **No Secrets in App**: Client-side code (Web/Mobile) is FORBIDDEN from accessing any secrets or raw API keys.
- **No Secrets in Logs**: Sanitization filters must remove PII and tokens from all application logs.

## 3. Access Controls
- **Service Role Forbidden**: The `service_role` key must NEVER be used in frontend/mobile code. It is reserved for secure Hetzner workers and backend scripts.
- **Role-Based Access (RBAC)**: Defined in `tenant_members.role`. 
    - `super_admin`: Full platform control.
    - `live_host`: Can create lives and media items.
    - `finance`: Access to sales and receivables.
    - `affiliate`: Access to their own clicks and commissions only.

## 4. API & Integration Security
- **Bling Access**: Mobile apps must call Supabase Edge Functions, which then call Bling using server-stored tokens.
- **Webhook Validation**: All external webhooks (Payments, ERP) must validate signatures and originate from known IP ranges where possible.
- **Idempotency**: All write-heavy integration APIs must require an idempotency key to prevent duplicate orders/payments.

## 5. Privacy & LGPD Compliance
- **PII Storage**: Minimal PII should be stored.
- **Push Notifications**: Must include a clear opt-in flow and an easy opt-out mechanism stored in `notification_preferences`.
- **Data Deletion**: Support for "Right to be Forgotten" must be implemented at the tenant level.
