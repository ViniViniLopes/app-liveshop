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
      product_id, 
      quantity = 1, 
      click_id, 
      affiliate_id,
      media_item_id,
      customer_email
    } = await req.json()

    // 1. Resolve Product & Price
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (!product) throw new Error('Product not found')

    // 2. Prepare Stripe Session
    // A URL de sucesso deve idealmente apontar para o app ou site do tenant
    const successUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
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
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successUrl}/`,
      customer_email: customer_email,
      metadata: {
        tenant_id,
        click_id: click_id || null,
        affiliate_id: affiliate_id || null,
        media_item_id: media_item_id || null,
        product_id: product.id,
        bling_product_id: product.bling_product_id
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
