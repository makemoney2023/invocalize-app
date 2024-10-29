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
      leads: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string
          concatenated_transcript: string | null
          created_at: string
          // Add other fields as needed
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone_number: string
          concatenated_transcript?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string
          concatenated_transcript?: string | null
          created_at?: string
        }
      }
      // Add other tables as needed
    }
  }
}

