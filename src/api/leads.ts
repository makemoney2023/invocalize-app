import { supabase } from '@/lib/supabase';
import { Lead } from '@/hooks/useLeadsData';

export const fetchLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Lead[];
};