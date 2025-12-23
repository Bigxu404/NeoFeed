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
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          api_key: string | null
          ai_config: Json | null
          notification_email: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          api_key?: string | null
          ai_config?: Json | null
          notification_email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          api_key?: string | null
          ai_config?: Json | null
          notification_email?: string | null
        }
      }
      feeds: {
        Row: {
          id: string
          created_at: string
          user_id: string
          url: string | null
          title: string | null
          content_raw: string | null
          summary: string | null
          takeaways: string[] | null
          tags: string[] | null
          category: string | null
          emotion: string | null
          reading_time: number | null
          status: 'pending' | 'processing' | 'done' | 'failed'
          source_type: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          url?: string | null
          title?: string | null
          content_raw?: string | null
          summary?: string | null
          takeaways?: string[] | null
          tags?: string[] | null
          category?: string | null
          emotion?: string | null
          reading_time?: number | null
          status?: 'pending' | 'processing' | 'done' | 'failed'
          source_type?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          url?: string | null
          title?: string | null
          content_raw?: string | null
          summary?: string | null
          takeaways?: string[] | null
          tags?: string[] | null
          category?: string | null
          emotion?: string | null
          reading_time?: number | null
          status?: 'pending' | 'processing' | 'done' | 'failed'
          source_type?: string | null
        }
      }
      weekly_reports: {
        Row: {
          id: string
          created_at: string
          user_id: string
          start_date: string
          end_date: string
          content: string | null
          summary: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          start_date: string
          end_date: string
          content?: string | null
          summary?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          start_date?: string
          end_date?: string
          content?: string | null
          summary?: string | null
          status?: string
        }
      }
    }
  }
}

// Helper types for easier consumption
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Feed = Database['public']['Tables']['feeds']['Row']
export type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row']

