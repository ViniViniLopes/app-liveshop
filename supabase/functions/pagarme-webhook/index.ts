import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const body = await req.json()
    const provider = 'pagarme'
    const externalEventId = body.id

    // 1. Persist Raw (Idempotency Check)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('status')
      .eq('provider', provider)
      .eq('external_event_id', externalEventId)
      .single()

    if (existingEvent?.status === 'processed') {
      return new Response('Already processed', { status: 200 })
    }

    const { error: logError } = await supabase.from('webhook_events').upsert({
      provider,
      external_event_id: externalEventId,
      payload: body,
      status: 'received'
    })

    if (logError) throw logError

    // 2. Process Success
    if (body.type === 'transaction.paid') {
      const transaction = body.data
      const metadata = transaction.metadata || {}

      // A. Create Sales Order
      const { data: order, error: orderError } = await supabase.from('sales_orders').insert({
        tenant_id: metadata.tenant_id,
        customer_id: metadata.customer_id,
        total_amount: transaction.amount / 100,
        status: 'paid',
        media_item_id: metadata.media_item_id,
        affiliate_id: metadata.affiliate_id,
        click_id: metadata.click_id,
        utm_metadata: metadata.utm || {}
      }).select().single()

      if (orderError) throw orderError

      // B. Create Receivable
      await supabase.from('receivables').insert({
        tenant_id: metadata.tenant_id,
        payment_id: transaction.id,
        amount: transaction.amount / 100,
        status: 'pending'
      })

      // C. Enqueue Bling Sync
      await supabase.from('notification_jobs').insert({
        tenant_id: metadata.tenant_id,
        type: 'bling_order_sync',
        payload: { order_id: order.id }
      })

      // D. Mark as Processed
      await supabase.from('webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('external_event_id', externalEventId)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
