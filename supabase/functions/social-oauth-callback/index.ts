import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { code, state, platform } = await req.json()
    const { tenantId, userId } = JSON.parse(atob(state))

    let tokenUrl = '';
    let clientId = '';
    let clientSecret = '';

    if (platform === 'youtube') {
      tokenUrl = 'https://oauth2.googleapis.com/token';
      clientId = Deno.env.get('GOOGLE_CLIENT_ID') ?? '';
      clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '';
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: Deno.env.get('SOCIAL_REDIRECT_URI') ?? ''
      })
    })

    const tokens = await response.json()

    // 1. Create Social Account
    const { data: account, error: accError } = await supabase.from('social_accounts').insert({
      tenant_id: tenantId,
      platform: platform,
      name: 'Linked Channel', // Fetch real name via API in production
    }).select().single()

    if (accError) throw accError

    // 2. Save Tokens
    await supabase.from('social_account_tokens').insert({
      social_account_id: account.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
