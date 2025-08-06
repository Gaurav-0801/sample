import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          title: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          content: string
          role: "user" | "assistant"
          image_url: string | null
          is_image: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          content: string
          role: "user" | "assistant"
          image_url?: string | null
          is_image?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          content?: string
          role?: "user" | "assistant"
          image_url?: string | null
          is_image?: boolean
          created_at?: string
        }
      }
    }
  }
}
