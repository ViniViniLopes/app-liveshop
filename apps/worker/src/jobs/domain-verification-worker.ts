import { createClient } from '@liveshop/database';
import { CloudflareClient } from '@liveshop/security';

/**
 * Job: Domain Verification Worker
 * Verifica se os domínios customizados dos tenants estão apontados corretamente.
 */
export async function domainVerificationWorker() {
  const supabase = createClient();
  
  const cf = new CloudflareClient({
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    zoneId: process.env.CLOUDFLARE_ZONE_ID!,
  });

  console.log('[job:domain-verify] Iniciando verificação de domínios...');

  // 1. Buscar domínios pendentes ou em verificação
  const { data: domains, error } = await supabase
    .from('tenant_domains')
    .select('*')
    .in('status', ['pending', 'verifying']);

  if (error || !domains) {
    console.error('[job:domain-verify] Erro ao buscar domínios:', error);
    return;
  }

  const EXPECTED_TARGET = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'liveshop.com.br';

  for (const domain of domains) {
    try {
      console.log(`[job:domain-verify] Verificando ${domain.hostname}...`);

      const isCorrect = await cf.verifyDns(domain.hostname, EXPECTED_TARGET);

      if (isCorrect) {
        await supabase
          .from('tenant_domains')
          .update({ 
            status: 'active', 
            verified_at: new Date().toISOString(),
            last_check_at: new Date().toISOString() 
          })
          .eq('id', domain.id);
        
        console.log(`[job:domain-verify] ✅ ${domain.hostname} ATIVADO.`);
      } else {
        await supabase
          .from('tenant_domains')
          .update({ 
            last_check_at: new Date().toISOString() 
          })
          .eq('id', domain.id);
        
        console.log(`[job:domain-verify] ⏳ ${domain.hostname} ainda pendente.`);
      }

    } catch (err) {
      console.error(`[job:domain-verify] Erro ao processar ${domain.hostname}:`, err);
    }
  }
}
