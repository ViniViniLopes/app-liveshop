import { supabase } from './supabase';

export async function toggleWishlist(productId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Auth required' };

  const userId = session.user.id;

  // Check if exists
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    // Remove
    return await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id);
  } else {
    // Add
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
