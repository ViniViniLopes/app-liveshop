# White-label storefronts and custom domains

LiveShop must work like a Nuvemshop-style SaaS: each tenant can publish a branded storefront with its own logo, colors, pages, live/video commerce experience and custom domain.

## Goals

- Default URL: `tenant-slug.liveshop.com.br`.
- Optional custom domain: `www.brand.com.br` or `brand.com.br`.
- Tenant-specific logo, favicon, OG image and theme tokens.
- The same branding must appear on live pages, video pages, replays, product cards, affiliate pages, checkout shell and dashboards.
- Host-based tenant resolution.
- Safe domain verification before activation.

## Runtime resolution

Every public request must resolve tenant by host:

1. Read `Host` header.
2. Normalize domain.
3. Match against active `tenant_domains.normalized_domain`.
4. If no custom domain matches, detect default subdomain.
5. Load `tenant_branding` and storefront settings.
6. Render the correct tenant storefront.

Do not trust `tenant_id` from query parameters for public storefront rendering.

## Vercel model

- Use Vercel for the Next.js storefront.
- Add a wildcard domain for tenant subdomains.
- Add custom domains to the Vercel project as each tenant verifies ownership.
- Show the customer the DNS records they must configure.
- Track verification and SSL status in Supabase.

## Branding model

Branding should be data-driven:

- logo_url
- favicon_url
- og_image_url
- primary_color
- accent_color
- background_color
- text_color
- button_radius
- card_radius
- font_family
- theme_tokens

Never hardcode tenant branding into the app.

## UI screens required

Dashboard → Store Settings → Branding

- Upload logo
- Upload favicon
- Choose colors
- Preview storefront
- Publish theme

Dashboard → Store Settings → Domains

- Add custom domain
- Show DNS instructions
- Verify domain
- Set as primary
- Disable/remove domain

## E2E tests

- Tenant A domain opens tenant A store.
- Tenant B cannot claim tenant A domain.
- Unverified domain does not activate.
- Default subdomain works.
- Custom domain works.
- Missing logo uses fallback.
- Theme colors apply to product cards and live pages.
- Affiliate URLs use the tenant's primary domain when available.
