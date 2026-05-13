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

    const url = new URL(req.url)
    const shortCode = url.searchParams.get('c')
    const mediaId  = url.searchParams.get('m')
    const tenantId = url.searchParams.get('t')

    if (!shortCode && !tenantId) {
      return new Response(JSON.stringify({ error: 'Missing code or tenant' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Resolve Affiliate Link
    const { data: link, error: linkError } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'Invalid link' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Create Click Record
    const { data: click, error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        tenant_id: link.tenant_id,
        affiliate_link_id: link.id,
        affiliate_id: link.affiliate_id,
        media_item_id: mediaId || link.media_item_id,
        bling_product_id: link.bling_product_id,
        utm_source: url.searchParams.get('utm_source') || link.utm_source,
        utm_medium: url.searchParams.get('utm_medium') || link.utm_medium,
        utm_campaign: url.searchParams.get('utm_campaign') || link.utm_campaign,
        referrer: req.headers.get('referer'),
      })
      .select('click_id')
      .single()

    if (clickError) throw clickError

    // 3. Increment Click Counter (Async)
    await supabase.rpc('increment_affiliate_clicks', { link_id: link.id })

    // 4. Redirect to Destination
    const destination = new URL(link.destination_url)
    destination.searchParams.set('ls_click_id', click.click_id)

    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': destination.toString() }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
