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
    
    // Ler metadados que injetamos na criacao
    const { tenant_id, product_id, click_id, affiliate_id, media_item_id, bling_product_id } = session.metadata || {}

    if (!tenant_id || !product_id) {
      console.error('Session missing required metadata:', session.metadata)
      return new Response('Missing metadata', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Criar o pedido (Sales Order)
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        tenant_id,
        total_amount: (session.amount_total || 0) / 100, // Volta pra Real
        status: 'paid', // Ja entra como pago pois e checkout completed
        click_id: click_id || null,
        media_item_id: media_item_id || null
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return new Response('Database error', { status: 500 })
    }

    // 2. Inserir os Itens (Order Items)
    // Para simplificar, consideramos 1 item baseado no metadata
    // Se fosse carrinho real, teriamos que usar session.line_items ou expand
    await supabase.from('order_items').insert({
      tenant_id,
      order_id: order.id,
      bling_product_id: bling_product_id,
      quantity: 1, // hardcoded for 1-click buy
      unit_price: (session.amount_total || 0) / 100
    })

    // 3. Registrar o Pagamento (Payments)
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
