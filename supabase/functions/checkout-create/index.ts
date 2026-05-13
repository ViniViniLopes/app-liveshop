import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "npm:stripe@^14.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      tenant_id, 
      cart_items, // Array of { product_id, quantity }
      click_id, 
      affiliate_id,
      media_item_id,
      customer_email
    } = await req.json()

    if (!cart_items || cart_items.length === 0) {
      throw new Error('Cart is empty')
    }

    const productIds = cart_items.map((item: any) => item.product_id)

    // 1. Resolve Products & Prices
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenant_id)
      .in('id', productIds)

    if (productsError || !products || products.length === 0) {
      throw new Error('Products not found or database error')
    }

    // 2. Calculate Total Amount & Build Line Items
    let totalAmount = 0
    const line_items: any[] = []
    const orderItemsToInsert: any[] = []

    for (const item of cart_items) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) throw new Error(`Product ${item.product_id} not found in DB`)

      const quantity = item.quantity || 1
      totalAmount += product.price * quantity

      line_items.push({
        price_data: {
          currency: 'brl',
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.main_image_url ? [product.main_image_url] : [],
          },
          unit_amount: Math.round(product.price * 100), // Stripe expects cents
        },
        quantity: quantity,
      })

      orderItemsToInsert.push({
        tenant_id,
        bling_product_id: product.bling_product_id,
        quantity: quantity,
        unit_price: product.price
      })
    }

    // 3. Create Pending Sales Order
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        tenant_id,
        total_amount: totalAmount,
        status: 'pending',
        click_id: click_id || null,
        media_item_id: media_item_id || null
      })
      .select()
      .single()

    if (orderError || !order) {
      throw new Error('Failed to create sales order')
    }

    // 4. Create Order Items
    const finalOrderItems = orderItemsToInsert.map(oi => ({ ...oi, order_id: order.id }))
    const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems)
    
    if (itemsError) {
      throw new Error('Failed to create order items')
    }

    // 5. Prepare Stripe Session
    const successUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'
    
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${successUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successUrl}/checkout`,
      customer_email: customer_email || undefined,
      metadata: {
        tenant_id,
        order_id: order.id,
        click_id: click_id || null,
        affiliate_id: affiliate_id || null,
        media_item_id: media_item_id || null,
      }
    })

    return new Response(JSON.stringify({ 
      payment_url: session.url,
      external_order_id: session.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
