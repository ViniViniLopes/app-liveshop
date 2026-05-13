import { supabase } from './supabase';
import type { Product, LiveSession, MediaItem } from '@liveshop/database/src/types';

/**
 * Busca todos os produtos ativos do tenant atual.
 */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

/**
 * Busca as sessões ao vivo (atuais ou agendadas).
 */
export async function fetchLiveSessions() {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*, media_items(*)')
    .order('started_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching live sessions:', error);
    return [];
  }

  return data as (LiveSession & { media_items: MediaItem })[];
}

/**
 * Busca um produto específico pelo ID.
 */
export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }

  return data as Product;
}

/**
 * Busca o histórico de pedidos do usuário logado.
 */
export async function fetchUserOrders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('sales_orders')
    .select('*')
    .eq('customer_email', session.user.email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
}

export async function toggleWishlist(productId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Auth required' };

  const userId = session.user.id;

  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    return await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id);
  } else {
    return await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        product_id: productId
      });
  }
}

export async function fetchUserWishlist() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      id,
      product_id,
      products (*)
    `)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data;
}
