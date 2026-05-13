import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Create Supabase client for use in workers and server-side code.
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from environment.
 * Uses service role — bypasses RLS. Never expose to browser/mobile clients.
 */
export function createClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Create Supabase anon client (respects RLS).
 * Use for public storefront server-side rendering or anon read queries.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // No browser, retornamos um mock ou um cliente vazio para não quebrar o bundle
    // mas o ideal é que as variáveis existam.
    console.error('Missing Supabase env vars');
    return createSupabaseClient<Database>('https://placeholder.supabase.co', 'placeholder');
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: true },
  });
}
