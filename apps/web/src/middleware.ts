import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * LiveShop Middleware — Tenant Resolution by Host Header
 *
 * Resolution order:
 * 1. localhost / 127.0.0.1  → dev tenant (no resolution, dev fallback)
 * 2. {slug}.liveshop.com.br → platform subdomain, slug = tenant_slug
 * 3. custom hostname         → lookup tenant_domains table by normalized hostname
 *
 * Injects headers:
 *   x-tenant-id    — UUID of resolved tenant
 *   x-tenant-slug  — slug of resolved tenant
 *
 * Routes bypassed (no tenant resolution needed):
 *   /admin/*       — super admin console
 *   /api/*         — API routes handle auth independently
 *   /_next/*       — Next.js internals
 *   /favicon.ico, /robots.txt, /sitemap.xml
 */

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'liveshop.com.br';
const DEV_TENANT_ID   = process.env.DEV_TENANT_ID ?? '';
const DEV_TENANT_SLUG = process.env.DEV_TENANT_SLUG ?? 'dev';

// Supabase service role client — server-side only, never exposed to browser
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service role env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = new URL(request.url);

  // 1. Bypass static assets and admin/api routes
  const bypass = [
    '/admin',
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];
  if (bypass.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);

  // 2. Local dev — inject dev tenant if env configured, skip DB lookup
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (DEV_TENANT_ID) {
      headers.set('x-tenant-id', DEV_TENANT_ID);
      headers.set('x-tenant-slug', DEV_TENANT_SLUG);
    }
    return NextResponse.next({ request: { headers } });
  }

  try {
    const supabase = getServiceClient();

    // 3. Platform subdomain: {slug}.liveshop.com.br
    if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
      const slug = hostname.replace(`.${PLATFORM_DOMAIN}`, '');

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle();

      if (!tenant) {
        return new NextResponse('Store not found', { status: 404 });
      }

      headers.set('x-tenant-id', tenant.id);
      headers.set('x-tenant-slug', tenant.slug);
      return NextResponse.next({ request: { headers } });
    }

    // 4. Custom domain — lookup tenant_domains
    const normalized = hostname.toLowerCase().replace(/^www\./, '');

    const { data: domain } = await supabase
      .from('tenant_domains')
      .select('tenant_id, tenants(id, slug)')
      .eq('hostname', normalized)
      .eq('is_verified', true)
      .eq('status', 'active')
      .maybeSingle();

    if (!domain || !domain.tenants) {
      return new NextResponse('Store not found', { status: 404 });
    }

    const tenant = Array.isArray(domain.tenants)
      ? domain.tenants[0]
      : domain.tenants;

    headers.set('x-tenant-id', tenant.id);
    headers.set('x-tenant-slug', tenant.slug);
    return NextResponse.next({ request: { headers } });

  } catch (err) {
    console.error('[middleware] tenant resolution error', err);
    // Fail open in dev, fail closed in prod
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
    return new NextResponse('Service unavailable', { status: 503 });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
