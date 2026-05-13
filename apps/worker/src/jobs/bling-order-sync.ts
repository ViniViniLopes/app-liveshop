import { createClient } from '@liveshop/database';
import { BlingClient } from '@liveshop/bling';

/**
 * Job: Bling Order Sync
 * Envia pedidos pagos da LiveShop para o Bling ERP.
 */
export async function blingOrderSync() {
  const supabase = createClient();
  
  console.log('[job:order-sync] Verificando novos pedidos para sincronizar...');

  // 1. Buscar pedidos pagos que ainda não foram sincronizados com o Bling
  const { data: orders, error } = await supabase
    .from('sales_orders')
    .select('*, tenant_id(*)') // Busca info do tenant para pegar o token do Bling
    .eq('status', 'paid')
    .is('bling_order_id', null);

  if (error || !orders) {
    console.error('[job:order-sync] Erro ao buscar pedidos:', error);
    return;
  }

  for (const order of orders) {
    try {
      const tenantId = order.tenant_id;
      
      // 2. Buscar conexão Bling do Tenant
      const { data: connection } = await supabase
        .from('bling_connections')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (!connection) continue;

      const bling = new BlingClient({
        clientId: process.env.BLING_CLIENT_ID!,
        clientSecret: process.env.BLING_CLIENT_SECRET!,
      }, connection.access_token);

      // 3. Montar Payload do Pedido para o Bling (V3)
      const blingPayload = {
        numero: order.order_number,
        data: new Date(order.created_at).toISOString().split('T')[0],
        contato: {
          nome: order.customer_name || 'Cliente LiveShop',
        },
        itens: [{
          codigo: order.sku || 'PROD-LS',
          descricao: order.product_name || 'Produto LiveShop',
          quantidade: 1,
          valor: order.total_amount,
        }],
        pagamentos: [{
          meio: 1, // Dinheiro/Pix
          valor: order.total_amount,
        }]
      };

      // 4. Enviar para o Bling
      console.log(`[job:order-sync] Enviando pedido ${order.id} para o Bling...`);
      const blingResponse = await bling.createOrder(blingPayload);
      
      const blingOrderId = blingResponse.data?.id;

      if (blingOrderId) {
        // 5. Atualizar pedido com o ID do Bling
        await supabase
          .from('sales_orders')
          .update({ 
            bling_order_id: String(blingOrderId),
            order_status: 'synced_to_erp' 
          })
          .eq('id', order.id);

        console.log(`[job:order-sync] ✅ Pedido ${order.id} sincronizado (Bling ID: ${blingOrderId})`);
      }

    } catch (err) {
      console.error(`[job:order-sync] Erro ao processar pedido ${order.id}:`, err);
    }
  }
}
