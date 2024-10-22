import { supabase } from '@/lib/supabase';
import { Lead } from '@/types/lead';

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
    .select(`
      id,
      name,
      email,
      phone_number,
      use_case,
      created_at,
      call_length,
      price,
      summary,
      concatenated_transcript,
      call_analyses (
        sentiment_score,
        key_points,
        customer_satisfaction,
        appointment_details
      )
    `)
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
