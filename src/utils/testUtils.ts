import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { z } from 'zod';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

const testLeadSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  concatenated_transcript: z.string().optional(),
  created_at: z.string(),
});

export async function insertTestLead() {
  const testData = {
    name: 'Test Lead',
    email: 'test@example.com',
    phone_number: '1234567890',
    concatenated_transcript: 'This is a test transcript',
    created_at: new Date().toISOString(),
  };

  try {
    const validatedData = testLeadSchema.parse(testData);
    
    const { data, error } = await supabase
      .from('leads')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error inserting test lead:', err);
    throw err;
  }
}
