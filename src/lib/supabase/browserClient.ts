import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export function createBrowserClient() {
  return createBrowserSupabaseClient();
}
