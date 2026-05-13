import { headers } from 'next/headers';
import { createClient } from '@liveshop/database';

export async function getTenantFromHost() {
  const host = headers().get('host') || '';
  const supabase = createClient();

  // Handle local development subdomains or production domains
  // Example: brand.liveshop.com.br or customdomain.com
  const domain = host.split(':')[0];

  const { data: tenantDomain, error } = await supabase
    .from('tenant_domains')
    .select('tenant_id, tenants(*)')
    .eq('hostname', domain)
    .single();

  if (error || !tenantDomain) {
    // Fallback: check by slug if subdomain format {slug}.liveshop...
    const slug = domain.split('.')[0];
    const { data: tenantBySlug } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    return tenantBySlug || null;
  }

  return tenantDomain.tenants;
}
