import { createAnonClient } from '@liveshop/database';

// O cliente anon é seguro para o browser pois respeita as RLS (Row Level Security)
export const supabase = createAnonClient();
