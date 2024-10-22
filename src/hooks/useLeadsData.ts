import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLeads } from '@/api/leads'
import { sendCallSummaryEmail } from '@/utils/sendEmail'
import { updateLeadWithGeoData } from '@/utils/geoUtils';
import OpenAI from 'openai'
import { analyzeTranscript, parseAnalysisResult } from '@/utils/analysisUtils';
import { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { Lead } from '@/types/lead'; // Ensure correct import

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeadsData();

    const leadsChannel: RealtimeChannel = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        async (payload: RealtimePostgresInsertPayload<Lead>) => {
          console.log('New lead inserted:', payload.new);
          setLeads((prevLeads) => [payload.new, ...prevLeads]);

          // Trigger analysis for the new lead
          await fetchAndUpdateAnalysis(payload.new.id);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to leads realtime channel');
        }
      });

    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, []);

  async function fetchLeadsData() {
    try {
      setLoading(true);
      const data = await fetchLeads();
      setLeads(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadChange(payload: any) {
    console.log('Lead change detected:', payload);
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const lead = payload.new;
      console.log('Processing lead:', lead.id);

      if (lead.concatenated_transcript && !lead.call_analyses) {
        console.log(`Analyzing transcript for lead ${lead.id}`);
        const analysisResponse = await analyzeTranscript(lead.concatenated_transcript);
        if (analysisResponse) {
          console.log('Analysis completed for lead:', lead.id, analysisResponse);
          
          // Insert the analysis results into the database
          const { error: insertError } = await supabase
            .from('call_analyses')
            .insert({
              lead_id: lead.id,
              sentiment_score: analysisResponse.sentiment_score,
              key_points: analysisResponse.key_points,
              customer_satisfaction: analysisResponse.customer_satisfaction,
              appointment_details: analysisResponse.appointment_details,
            });

          if (insertError) {
            console.error('Error inserting analysis into database:', insertError);
          } else {
            console.log('Analysis inserted successfully for lead:', lead.id);
          }

          // Fetch the updated lead data
          const { data: updatedLead, error: fetchError } = await supabase
            .from('leads')
            .select(`*, call_analyses (*)`)
            .eq('id', lead.id)
            .single();

          if (fetchError) {
            console.error('Error fetching updated lead:', fetchError);
          } else if (updatedLead) {
            console.log('Fetched updated lead:', updatedLead);
            // Send email after analysis is complete and lead is updated
            try {
              console.log('Attempting to send email for lead:', updatedLead.id);
              await sendEmailAfterAnalysis(updatedLead);
              console.log('Email sent successfully for lead:', updatedLead.id);
            } catch (error) {
              console.error('Failed to send email for lead:', updatedLead.id, error);
            }
          }
        }
      }
    }
    await fetchLeadsData();
  }

  async function fetchAndUpdateAnalysis(leadId: string) {
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (lead && lead.concatenated_transcript) {
        // Call the API route
        const response = await fetch('/api/analyze-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId,
            transcript: lead.concatenated_transcript,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze transcript');
        }

        const result = await response.json();
        console.log('Analysis result:', result);

        // Refresh the leads data
        await fetchLeadsData();

        // Fetch the updated lead including analysis
        const { data: updatedLead, error: fetchError } = await supabase
          .from('leads')
          .select(`*, call_analyses (*)`)
          .eq('id', leadId)
          .single();

        if (fetchError) {
          console.error('Error fetching updated lead:', fetchError);
        } else if (updatedLead) {
          console.log('Fetched updated lead:', updatedLead);

          // Send email after analysis is complete and lead is updated
          try {
            console.log('Attempting to send email for lead:', updatedLead.id);
            await sendEmailAfterAnalysis(updatedLead);
            console.log('Email sent successfully for lead:', updatedLead.id);
          } catch (error) {
            console.error('Failed to send email for lead:', updatedLead.id, error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching and updating analysis:', error);
    }
  }

  return { leads, loading, error }
}

function extractSentimentScore(analysis: any): number {
  if (typeof analysis.sentiment_score === 'number') {
    return analysis.sentiment_score;
  }
  return 0; // Default value if sentiment score is not found or invalid
}

function extractKeyPoints(analysis: any): string[] {
  if (Array.isArray(analysis.key_points)) {
    return analysis.key_points;
  }
  return []; // Return an empty array if key points are not found or invalid
}

function extractCustomerSatisfaction(analysis: any): string {
  if (typeof analysis.customer_satisfaction === 'string') {
    return analysis.customer_satisfaction;
  }
  return 'Unknown'; // Default value if customer satisfaction is not found or invalid
}

function extractAppointmentDetails(analysis: any): string {
  if (typeof analysis.appointment_details === 'string') {
    return analysis.appointment_details;
  }
  return 'No appointment details'; // Default value if appointment details are not found or invalid
}

async function sendEmailAfterAnalysis(updatedLead: Lead) {
  try {
    await sendCallSummaryEmail(updatedLead);
    console.log('Email sent successfully for lead:', updatedLead.id);
  } catch (error) {
    console.error('Failed to send email for lead:', updatedLead.id, error);
  }
}
