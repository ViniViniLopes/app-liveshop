'use client';

import { createClient } from '@liveshop/database';

export function useSupabaseActionEvent() {
  const supabase = createClient();

  const trackAction = async (params: {
    tenantId: string;
    actionType: string;
    mediaItemId?: string;
    blingProductId?: string;
    metadata?: any;
    affiliateId?: string;
    clickId?: string;
  }) => {
    try {
      const { error } = await supabase.from('ui_action_events').insert({
        tenant_id: params.tenantId,
        action_type: params.actionType,
        media_item_id: params.mediaItemId,
        bling_product_id: params.blingProductId,
        metadata: params.metadata || {},
        affiliate_id: params.affiliateId,
        click_id: params.clickId,
      });

      if (error) console.error('Tracking Error:', error);
    } catch (e) {
      console.error('Failed to track action:', e);
    }
  };

  return { trackAction };
}
