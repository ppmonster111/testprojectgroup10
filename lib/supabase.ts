import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: "male" | "female" | "other" | null
          year_of_study: number | null
          height: number | null
          weight: number | null
          bmi: number | null
          medical_conditions: string | null
          allergies: string | null
          surgery_history: string | null
          faculty: string | null
          consumption_score: number | null
          consumption_data: any | null
          nutrition_knowledge_score: number | null
          nutrition_skills_score: number | null
          nutrition_perception_score: number | null
          nutrition_data: any | null
          stress_score: number | null
          stress_level: string | null
          stress_data: any | null
          recommendations: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: "male" | "female" | "other" | null
          year_of_study?: number | null
          height?: number | null
          weight?: number | null
          bmi?: number | null
          medical_conditions?: string | null
          allergies?: string | null
          surgery_history?: string | null
          faculty?: string | null
          consumption_score?: number | null
          consumption_data?: any | null
          nutrition_knowledge_score?: number | null
          nutrition_skills_score?: number | null
          nutrition_perception_score?: number | null
          nutrition_data?: any | null
          stress_score?: number | null
          stress_level?: string | null
          stress_data?: any | null
          recommendations?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: "male" | "female" | "other" | null
          year_of_study?: number | null
          height?: number | null
          weight?: number | null
          bmi?: number | null
          medical_conditions?: string | null
          allergies?: string | null
          surgery_history?: string | null
          faculty?: string | null
          consumption_score?: number | null
          consumption_data?: any | null
          nutrition_knowledge_score?: number | null
          nutrition_skills_score?: number | null
          nutrition_perception_score?: number | null
          nutrition_data?: any | null
          stress_score?: number | null
          stress_level?: string | null
          stress_data?: any | null
          recommendations?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
