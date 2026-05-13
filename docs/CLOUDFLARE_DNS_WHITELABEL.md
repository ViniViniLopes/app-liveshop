# Cloudflare DNS White-Label Architecture

## Decision

Use Cloudflare DNS Free as the default DNS management layer for white-label storefront domains.

The platform still uses:

- Vercel for Next.js frontend hosting.
- Supabase for tenant/domain state.
- Hetzner workers for DNS automation, status checks and retries.
- Cloudflare DNS for DNS records and nameserver-based domain onboarding.

## Why

This gives the LiveShop a Nuvemshop-like experience:

- Each tenant can use a custom domain.
- Each tenant has branded storefront URLs.
- The backend can automate DNS checks and records.
- The platform can keep a fallback subdomain.
- DNS can remain free for basic authoritative DNS usage.

## Important limitation

Cloudflare DNS does not replace Vercel domain verification or SSL issuance. If the frontend runs on Vercel, the domain must also be configured/verified in Vercel or routed through a supported frontend target.

## Domain modes

### 1. Default platform subdomain

Example:

```txt
brand.liveshop.com.br
```

This domain is always created by the platform and remains active as fallback.

Recommended DNS record:

```txt
Type: CNAME
Name: brand
Target: cname.vercel-dns.com
Proxy: DNS-only initially
```

### 2. Managed custom domain with Cloudflare

Example:

```txt
www.brand.com.br
```

Flow:

1. Tenant enters the domain.
2. Backend creates domain row and verification token.
3. Backend creates or registers Cloudflare zone.
4. Tenant receives Cloudflare nameservers.
5. Tenant changes nameservers at registrar.
6. Worker polls Cloudflare zone status.
7. Worker creates storefront DNS records.
8. Backend verifies route and SSL.
9. Domain becomes active.

### 3. External/manual DNS

For tenants who already use another DNS provider:

1. Show TXT verification record.
2. Show CNAME/A/ALIAS instructions.
3. Poll DNS status.
4. Activate after verification.

## Required records

### Custom subdomain / www

```txt
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: DNS-only initially
```

### Apex domain

Use one of:

- ALIAS/ANAME/CNAME flattening when available.
- A record(s) required by the frontend hosting provider.
- Redirect apex to `www` when simpler.

### Verification

```txt
Type: TXT
Name: _liveshop-verify
Value: liveshop-verify=<token>
```

## Backend services

Create a package:

```txt
packages/cloudflare-dns/
├── cloudflareClient.ts
├── domainNormalizer.ts
├── dnsRecordService.ts
├── zoneService.ts
├── verificationService.ts
├── vercelDomainService.ts
└── hostResolver.ts
```

## API routes

```txt
POST /api/domains
POST /api/domains/:id/verify
POST /api/domains/:id/cloudflare-zone
POST /api/domains/:id/dns-records
GET  /api/domains/:id/status
DELETE /api/domains/:id
```

## Worker jobs

```txt
domain.verify_txt
domain.check_nameservers
domain.upsert_dns_records
domain.check_ssl
domain.check_route
domain.activate
domain.retry_failed
```

## Security

- Cloudflare API tokens must be server-only.
- Prefer scoped API tokens.
- Never expose tokens to mobile/browser clients.
- Do not allow a tenant to attach a domain that is already active for another tenant.
- Verify ownership before activating.
- Host header routing must resolve tenant from `tenant_domains`, not from query params.
- Keep the fallback subdomain active.

## E2E test

1. Create tenant.
2. Create default subdomain.
3. Add logo/theme.
4. Add custom domain.
5. Generate TXT verification token.
6. Create Cloudflare DNS records.
7. Verify DNS.
8. Verify Vercel/frontend route.
9. Open storefront with custom domain.
10. Confirm correct tenant branding.
11. Confirm another tenant cannot access this domain.
