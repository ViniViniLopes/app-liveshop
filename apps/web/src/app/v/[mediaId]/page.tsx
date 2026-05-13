import { notFound } from 'next/navigation';
import { createClient } from '@liveshop/database';
import { getTenantFromHost } from '@/lib/tenant';
import { ShoppableMediaScreen } from '@/components/live/ShoppableMediaScreen';

interface PageProps {
  params: { mediaId: string };
  searchParams: { a?: string; click_id?: string };
}

export default async function VideoPage({ params, searchParams }: PageProps) {
  const tenant = await getTenantFromHost();
  if (!tenant) return notFound();

  const supabase = createClient();
  
  // 1. Fetch Media Item
  const { data: mediaItem, error: mediaError } = await supabase
    .from('media_items')
    .select('*')
    .eq('id', params.mediaId)
    .eq('tenant_id', tenant.id)
    .single();

  if (mediaError || !mediaItem) return notFound();

  // 2. Fetch Product Cache (Bling Source of Truth)
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('bling_product_id', mediaItem.bling_product_id)
    .single();

  if (productError || !product) return notFound();

  // 3. Register View Action
  await supabase.from('ui_action_events').insert({
    tenant_id: tenant.id,
    action_type: 'view_media',
    media_item_id: mediaItem.id,
    bling_product_id: product.id,
    metadata: {
      user_agent: 'server',
      utm_source: searchParams.a ? 'affiliate' : undefined
    },
    affiliate_id: searchParams.a,
    click_id: searchParams.click_id
  });

  return (
    <ShoppableMediaScreen 
      mediaItem={mediaItem} 
      product={product} 
      tenant={tenant}
      tracking={{
        affiliateId: searchParams.a,
        clickId: searchParams.click_id
      }}
    />
  );
}
