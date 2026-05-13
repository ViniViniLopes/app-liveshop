import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase Server Client
 * For use in Next.js Server Components, Route Handlers and Server Actions.
 * Uses the anon key — respects RLS.
 * For service-role operations (workers, middleware), use createServiceClient().
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Supabase Service Role Client
 * Bypasses RLS. Use ONLY in server-side code (workers, admin routes, middleware).
 * NEVER expose the service role key to the browser.
 */
export function createServiceClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
