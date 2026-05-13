'use server';

import { headers } from 'next/headers';

export async function createStripeCheckoutSession(cartItems: any[], customerEmail?: string) {
  const headerList = await headers();
  const tenantId = headerList.get('x-tenant-id');

  if (!tenantId) {
    throw new Error('Tenant ID missing from headers');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');

  const response = await fetch(`${supabaseUrl}/functions/v1/checkout-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Edge functions usually require the anon key or service role key in Authorization.
      // We will pass the anon key to allow CORS/invocation, the edge function itself does its job.
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      cart_items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
      customer_email: customerEmail,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  return data.payment_url;
}
