import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { domain_id, tenant_id } = await req.json()

    // 1. Get Domain Info
    const { data: domain } = await supabase
      .from('tenant_domains')
      .select('*')
      .eq('id', domain_id)
      .eq('tenant_id', tenant_id)
      .single()

    if (!domain) throw new Error('Domain not found')

    // 2. Perform DNS check via public resolver
    const hostname = domain.hostname
    const target = Deno.env.get('PLATFORM_DOMAIN') || 'liveshop.com.br'
    
    const dnsResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${hostname}&type=CNAME`, {
      headers: { 'Accept': 'application/dns-json' }
    })
    const dnsData = await dnsResponse.json()
    const records = dnsData.Answer || []
    const isCorrect = records.some((r: any) => r.data.includes(target))

    if (isCorrect) {
      await supabase
        .from('tenant_domains')
        .update({ status: 'active', verified_at: new Date().toISOString() })
        .eq('id', domain_id)

      return new Response(JSON.stringify({ status: 'verified', message: 'DNS configured correctly!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ status: 'pending', message: 'DNS not yet propagated.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
