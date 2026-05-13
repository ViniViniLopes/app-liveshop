import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    const payload = await req.json()
    const { id: payment_id, status, order_id } = payload

    // 1. Initialize Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 2. Map Pagar.me status to our internal status
    let internalStatus = 'pending'
    if (status === 'paid') internalStatus = 'paid'
    if (status === 'failed' || status === 'canceled') internalStatus = 'canceled'

    // 3. Update Order
    const { error } = await supabase
      .from('sales_orders')
      .update({ 
        payment_status: internalStatus,
        payment_id_external: payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Order updated' }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
