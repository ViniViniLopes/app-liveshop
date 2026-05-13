import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    const { order_id } = await req.json()

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 2. Fetch Order Data with Items
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .single()

    if (orderError || !order) throw new Error('Order not found')

    // 3. Prepare XML for Bling (Conceptual)
    // Note: Bling API v2 uses XML; v3 uses JSON. 
    // We'll use a placeholder for the actual API call.
    
    console.log(`Syncing order ${order_id} to Bling...`)

    // 4. Update Sync Status
    await supabase
      .from('sales_orders')
      .update({ 
        bling_status: 'synced',
        bling_sync_at: new Date().toISOString()
      })
      .eq('id', order_id)

    return new Response(
      JSON.stringify({ success: true, bling_order_id: 'MOCKED_BLING_ID' }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
