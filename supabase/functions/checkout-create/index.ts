import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
      customer_email,
      customer_name
    } = await req.json()

    // 1. Resolve Product & Price
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (!product) throw new Error('Product not found')

    // 2. Prepare Pagar.me Payload (V5 API)
    // Aqui injetamos os metadados que o webhook vai ler depois
    const pagarmePayload = {
      items: [{
        amount: Math.round(product.price * 100),
        description: product.name,
        quantity: quantity,
        code: product.sku
      }],
      customer: {
        name: customer_name || 'Customer',
        email: customer_email || 'customer@example.com',
        type: 'individual',
        document: '00000000000' // Mock, em produção viria do form
      },
      payments: [{
        payment_method: 'checkout',
        checkout: {
          expires_in: 120,
          billing_address_editable: true,
          customer_editable: true,
          accepted_payment_methods: ['credit_card', 'pix', 'boleto'],
          success_url: `https://store.liveshop.com.br/success`,
        }
      }],
      metadata: {
        tenant_id,
        click_id,
        affiliate_id,
        media_item_id,
        product_id: product.id,
        bling_product_id: product.bling_product_id
      }
    }

    // 3. Call Pagar.me API (Mocking fetch for now)
    // const response = await fetch('https://api.pagar.me/core/v5/orders', { ... })
    
    // Simulating Pagar.me Response
    const mockOrder = {
      id: `or_${Math.random().toString(36).substr(2, 9)}`,
      checkouts: [{ payment_url: `https://checkout.pagar.me/${Math.random().toString(36).substr(2, 9)}` }]
    }

    return new Response(JSON.stringify({ 
      payment_url: mockOrder.checkouts[0].payment_url,
      external_order_id: mockOrder.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
