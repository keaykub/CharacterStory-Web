export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          credits: number
          created_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          credits?: number
          created_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          credits?: number
          created_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          prompt: string
          gender: string | null
          age: number | null
          role: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          prompt: string
          gender?: string | null
          age?: number | null
          role?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          prompt?: string
          gender?: string | null
          age?: number | null
          role?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scenes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          description: string
          prompt: string
          aspect_ratio: string
          character_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          description: string
          prompt: string
          aspect_ratio?: string
          character_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          description?: string
          prompt?: string
          aspect_ratio?: string
          character_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      chat_logs: {
        Row: {
          id: string
          user_id: string
          type: string
          messages: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          messages: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          messages?: any
          created_at?: string
        }
      }
      credit_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}