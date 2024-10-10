import { supabase } from '@/lib/supabase';
import { Lead } from '@/hooks/useLeadsData';

export interface Appointment {
  id: string;
  lead_id: string;
  date: string;
  time: string;
  note: string;
  name: string;
  email: string;
  phone_number: string;
  use_case: string;
}

export const fetchLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Lead[];
};

export const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Appointment[];
};