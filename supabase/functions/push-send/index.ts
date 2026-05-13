import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

serve(async (req) => {
  try {
    const { user_id, title, body, data } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Push Send] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }

    // 1. Initialize Supabase Admin (uses service role from env)
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

    // 2. Fetch all active tokens for this user
    const { data: tokens, error: tokenError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', user_id)

    if (tokenError) {
      console.error(`[Push Send] Database error fetching tokens for user ${user_id}:`, tokenError);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      console.log(`[Push Send] No tokens found for user ${user_id}`);
      return new Response(
        JSON.stringify({ message: 'No tokens found for user' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Prepare messages for Expo
    const messages = tokens.map(t => ({
      to: t.token,
      sound: 'default',
      title: title || 'Liveshop Zen',
      body: body || 'Novo Drop começando agora! 🔥',
      data: data || { screen: 'live' },
    }))

    console.log(`[Push Send] Sending ${messages.length} messages for user ${user_id}`);

    // 4. Send to Expo
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Push Send] Expo API error: ${response.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: 'Failed to send via Expo API' }), { status: 502 });
    }

    const result = await response.json()
    console.log(`[Push Send] Successfully sent messages via Expo`);

    return new Response(
      JSON.stringify({ success: true, expo_response: result }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[Push Send] Unhandled exception:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
