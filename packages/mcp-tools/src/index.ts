import { createClient } from '@liveshop/database';
import { BlingClient } from '@liveshop/bling';
import { syncBlingData } from '../../../apps/worker/src/jobs/bling-sync';
import { processPublicationJob } from '../../../apps/worker/src/jobs/publication-worker';

export const mcpTools = {
  'bling.products.sync': async (tenantId: string) => {
    await syncBlingData(tenantId);
    return { success: true, message: 'Bling sync initiated' };
  },

  'media.bindProduct': async (mediaItemId: string, productId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('media_items')
      .update({ bling_product_id: productId })
      .eq('id', mediaItemId);
    if (error) throw error;
    return { success: true };
  },

  'autopost.publish': async (jobId: string) => {
    await processPublicationJob(jobId);
    return { success: true };
  },

  'sales.getSummary': async (tenantId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('sales_orders')
      .select('total_amount, status')
      .eq('tenant_id', tenantId);
    
    const total = data?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
    return { total, count: data?.length || 0 };
  },

  'domains.verify': async (domainId: string) => {
    // This would call the domain verification logic
    return { status: 'initiated' };
  },

  'security.auditTenant': async (tenantId: string) => {
    const supabase = createClient();
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .limit(10);
    return { logs };
  }
};
