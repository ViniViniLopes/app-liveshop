import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "npm:stripe@^14.0.0"

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!stripeKey || !endpointSecret) {
    return new Response('Stripe config missing', { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })
  
  let event;
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    // Read metadata injected during checkout session creation
    const { tenant_id, order_id, click_id, affiliate_id, media_item_id } = session.metadata || {}

    if (!tenant_id || !order_id) {
      console.error('Session missing required metadata:', session.metadata)
      return new Response('Missing metadata', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Update the pending order to 'paid'
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .update({ status: 'paid' })
      .eq('id', order_id)
      .eq('tenant_id', tenant_id)
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error updating order:', orderError)
      return new Response('Database error', { status: 500 })
    }

    // 2. Register the payment
    await supabase.from('payments').insert({
      tenant_id,
      order_id: order.id,
      gateway: 'stripe',
      external_id: session.id,
      amount: (session.amount_total || 0) / 100,
      status: 'paid',
      payload: session
    })

    console.log(`✅ Order ${order.id} processed successfully for session ${session.id}`)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
