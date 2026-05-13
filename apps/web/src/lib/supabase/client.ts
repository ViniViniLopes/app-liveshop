'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/supabase/../../../packages/database/src/types';

let client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Supabase Browser Client (singleton)
 * For use in Client Components only.
 * Uses the anon key — respects RLS.
 */
export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase public env vars');
  }

  client = createSupabaseClient<Database>(url, key);
  return client;
}
