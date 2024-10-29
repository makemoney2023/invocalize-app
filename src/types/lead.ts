import { z } from 'zod'

export const callAnalysisSchema = z.object({
  id: z.string(),
  content: z.string(),
  sentiment: z.number(),
  sentiment_score: z.number(),
  customer_satisfaction: z.string(),
  created_at: z.string(),
  lead_id: z.string(),
  key_points: z.array(z.string()),
  risk_level: z.enum(['high', 'medium', 'low'])
}).strict()

export const leadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone_number: z.string().optional(),
  company: z.string().optional(),
  created_at: z.string(),
  status: z.enum(['new', 'converted', 'lost', 'in_progress']).default('new'),
  last_contact_date: z.string().optional(),
  concatenated_transcript: z.string().optional(),
  role: z.string().optional(),
  use_case: z.string().optional(),
  call_id: z.string().optional(),
  call_status: z.string().optional(),
  call_length: z.number().optional(),
  batch_id: z.string().nullish(),
  to_number: z.string().optional(),
  from_number: z.string().optional(),
  request_data: z.any().optional(),
  completed: z.boolean().optional(),
  inbound: z.boolean().optional(),
  queue_status: z.string().optional(),
  endpoint_url: z.string().optional(),
  max_duration: z.number().optional(),
  error_message: z.string().nullish(),
  variables: z.record(z.string(), z.any()).optional(),
  answered_by: z.string().optional(),
  record: z.boolean().optional(),
  recording_url: z.string().optional(),
  c_id: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  summary: z.string().optional(),
  price: z.number().optional(),
  started_at: z.string().optional(),
  local_dialing: z.boolean().optional(),
  call_ended_by: z.string().optional(),
  pathway_logs: z.array(z.any()).nullish(),
  analysis_schema: z.any().optional(),
  analysis: z.any().optional(),
  corrected_duration: z.number().optional(),
  end_at: z.string().optional(),
  transcripts: z.union([z.array(z.any()), z.string(), z.null()]).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().nullish(),
  updated_at: z.string().optional(),
  location: z.any().nullish(),
  interactions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    date: z.string()
  })).optional(),
  call_analyses: z.array(callAnalysisSchema).optional()
}).strict()

export type Lead = z.infer<typeof leadSchema>
export type CallAnalysis = z.infer<typeof callAnalysisSchema>
