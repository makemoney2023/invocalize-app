import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './types';

export const createServer = () =>
  createServerComponentClient<Database>({
    cookies,
  });

export function createClient() {
  const cookieStore = cookies()

  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

export function createServerClient() {
  const cookieStore = cookies()
  
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  })
}
