import { Lead } from '@/hooks/useLeadsData';

export const calculateAverageDuration = (leads: Lead[]): number => {
  const totalDuration = leads.reduce((sum, lead) => sum + lead.call_length, 0);
  return leads.length ? totalDuration / leads.length : 0;
};
