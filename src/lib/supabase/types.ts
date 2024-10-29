export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      crm_contacts: {
        Row: {
          id: string
          lead_id: string
          name: string
          email: string
          phone_number: string
          company?: string
          last_contact_date: string
          notes?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string
          company?: string
          role?: string
          use_case?: string
          call_status?: string
          call_length?: number
          price?: number
          summary?: string
          concatenated_transcript?: string
          city?: string
          state?: string
          country?: string
          recording_url?: string
          completed?: boolean
          created_at: string
          updated_at?: string
          analysis?: {
            sentiment_score: number
            key_points: string[]
            customer_satisfaction: number
            appointment_details?: string
          }
          call_analyses?: Array<{
            id: string
            sentiment_score: number
            key_points: string[]
            customer_satisfaction: number
            appointment_details?: string
          }>
          transcripts?: Array<{
            id: string
            content: string
            user: string
            text: string
            created_at: string
          }>
        }
      }
      appointments: {
        Row: {
          id: string
          lead_id: string
          date: string
          time: string
          note: string
          name: string
          email: string
          phone_number: string
        }
      }
      call_analyses: {
        Row: {
          id: string
          lead_id: string
          sentiment_score: number
          key_points: string[]
          customer_satisfaction: number
          appointment_details?: string
        }
      }
    }
  }
}
