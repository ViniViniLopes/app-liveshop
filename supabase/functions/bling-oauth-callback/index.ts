import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, state } = await req.json()
    const { tenantId, userId } = JSON.parse(atob(state))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const clientId = Deno.env.get('BLING_CLIENT_ID')
    const clientSecret = Deno.env.get('BLING_CLIENT_SECRET')
    const redirectUri = Deno.env.get('BLING_REDIRECT_URI')

    const credentials = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri ?? ''
      })
    })

    const tokens = await tokenResponse.json()
    if (tokens.error) throw new Error(tokens.error_description || tokens.error)

    // Save to bling_connections
    // Note: In a production app, tokens should be encrypted before saving
    // or saved into Supabase Vault using a postgres function.
    const { error: upsertError } = await supabase
      .from('bling_connections')
      .upsert({
        tenant_id: tenantId,
        access_token: tokens.access_token, // Ideally encrypted
        refresh_token: tokens.refresh_token, // Ideally encrypted
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        status: 'active'
      })

    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
