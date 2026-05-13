import { redirect } from 'next/navigation';
import { createClient } from '@liveshop/database';

interface PageProps {
  params: { shortCode: string };
}

export default async function ShortLinkRedirect({ params }: PageProps) {
  const supabase = createClient();
  
  // 1. Resolve Short Code
  const { data: link, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('code', params.shortCode)
    .single();

  if (error || !link) return redirect('/');

  // 2. Generate Click ID
  const clickId = crypto.randomUUID();

  // 3. Register Click
  await supabase.from('affiliate_clicks').insert({
    tenant_id: link.tenant_id,
    affiliate_link_id: link.id,
    affiliate_id: link.affiliate_id,
    media_item_id: link.media_item_id,
    bling_product_id: link.bling_product_id,
    click_id: clickId,
    // UTMs from current search params would be ideal, but for /r/ we redirect
  });

  // 4. Redirect with Click ID and Affiliate ID
  const destUrl = new URL(link.destination_url);
  destUrl.searchParams.set('click_id', clickId);
  destUrl.searchParams.set('a', link.affiliate_id);

  return redirect(destUrl.toString());
}
