import { createClient } from '@liveshop/database';
import { BlingClient } from '@liveshop/bling';

/**
 * Job: Bling Product Sync
 * Sincroniza produtos, preços e estoque de todos os tenants ativos.
 */
export async function blingSync() {
  const supabase = createClient();
  
  console.log('[job:bling-sync] Iniciando varredura de integrações...');

  const { data: connections, error } = await supabase
    .from('bling_connections')
    .select('*, tenants(id, slug)')
    .eq('status', 'connected');

  if (error || !connections) {
    console.error('[job:bling-sync] Erro ao buscar conexões:', error);
    return;
  }

  for (const conn of connections) {
    const tenantId = conn.tenant_id;
    const tenantSlug = (conn.tenants as any)?.slug || 'unknown';

    try {
      // 1. Resolve Token
      const bling = new BlingClient({
        clientId: process.env.BLING_CLIENT_ID!,
        clientSecret: process.env.BLING_CLIENT_SECRET!,
      }, conn.access_token);

      // 2. Create Sync Log
      const { data: syncLog } = await supabase
        .from('sync_logs')
        .insert({
          tenant_id: tenantId,
          provider: 'bling',
          sync_type: 'products',
          status: 'processing',
        })
        .select()
        .single();

      // 3. Paginated Product Sync
      let page = 1;
      let totalProcessed = 0;
      let totalFailed = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await bling.getProducts({ pagina: page, limite: 100 });
        const products = response.data || [];

        if (products.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of products) {
          try {
            await supabase.from('products').upsert({
              tenant_id: tenantId,
              bling_product_id: String(item.id),
              sku: item.codigo,
              name: item.nome,
              price: item.preco,
              status: item.situacao === 'A' ? 'active' : 'inactive',
              raw_bling_data: item,
            }, { onConflict: 'tenant_id, bling_product_id' });
            
            totalProcessed++;
          } catch (e) {
            totalFailed++;
          }
        }
        page++;
      }

      // 4. Update Log
      if (syncLog) {
        await supabase.from('sync_logs').update({
          status: 'success',
          records_processed: totalProcessed,
          records_failed: totalFailed,
          finished_at: new Date().toISOString(),
        }).eq('id', syncLog.id);
      }

      console.log(`[job:bling-sync][${tenantSlug}] Sync concluído: ${totalProcessed} ok.`);

    } catch (err) {
      console.error(`[job:bling-sync][${tenantSlug}] Falha:`, err);
    }
  }
}
