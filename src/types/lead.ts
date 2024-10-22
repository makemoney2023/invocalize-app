export interface Lead {
  country: string;
  status: string;
  city: string;
  state: string;
  id: string;
  name: string;
  email: string;
  phone_number: string;
  company: string;
  role: string;
  use_case: string;
  call_id: string;
  call_status: string;
  call_length: number;
  batch_id: string | null;
  to_number: string;
  from_number: string;
  request_data: string;
  completed: boolean;
  inbound: boolean;
  queue_status: string;
  endpoint_url: string;
  max_duration: number;
  error_message: string | null;
  variables?: {
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
  };
  answered_by: string;
  record: boolean;
  recording_url: string | null;
  c_id: string;
  metadata: {
    name: string;
    role: string;
    email: string;
    leadId: string;
    company: string;
    useCase: string;
  };
  summary: string;
  price: number;
  started_at: string;
  local_dialing: boolean;
  call_ended_by: string;
  pathway_logs: any;
  analysis_schema: any;
  corrected_duration: number;
  end_at: string;
  call_transcript: Array<{
    id: number;
    text: string;
    user: string;
    created_at: string;
  }> | [];
  concatenated_transcript?: string;
  analysis: AnalysisDetails;
  pathway: any;
  created_at: string;
  updated_at: string;
  transcripts: Array<{
    user: string;
    text: string;
  }>;
  location?: string; // WKB format
  ai_analysis?: string;
  call_analyses?: CallAnalysis[];
}

interface AnalysisDetails {
  key_points: any;
  customer_satisfaction: any;
  appointment: any;
  appointment_date?: string;
  appointment_time?: string;
  appointment_booked?: boolean;
  sentiment_score?: number;
  summary?: string;
  topics?: string[];
  action_items?: string[];
  questions?: string[];
}

export interface CallAnalysis {
  lead_id: string;
  sentiment_score: number;
  key_points: string[];
  customer_satisfaction: string;
  appointment_details: string;
}
