export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type: string | null
          file_name: string
          file_path: string
          id: string
          parent_id: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          target_program_id: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          file_name: string
          file_path: string
          id?: string
          parent_id?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          target_program_id?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          document_type?: string | null
          file_name?: string
          file_path?: string
          id?: string
          parent_id?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          target_program_id?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_target_program_id_fkey"
            columns: ["target_program_id"]
            isOneToOne: false
            referencedRelation: "target_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          city: string | null
          country: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          ranking: number | null
          tuition_max: number | null
          tuition_min: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          ranking?: number | null
          tuition_max?: number | null
          tuition_min?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          ranking?: number | null
          tuition_max?: number | null
          tuition_min?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_identity_locked: boolean
          last_name: string | null
          middle_name: string | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_identity_locked?: boolean
          last_name?: string | null
          middle_name?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_identity_locked?: boolean
          last_name?: string | null
          middle_name?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          currency: string | null
          deadline: string | null
          degree_level: string
          duration_months: number | null
          id: string
          intake: string | null
          is_active: boolean
          language: string | null
          name: string
          organisation_id: string
          requirements: Json | null
          tuition: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          deadline?: string | null
          degree_level: string
          duration_months?: number | null
          id?: string
          intake?: string | null
          is_active?: boolean
          language?: string | null
          name: string
          organisation_id: string
          requirements?: Json | null
          tuition?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          deadline?: string | null
          degree_level?: string
          duration_months?: number | null
          id?: string
          intake?: string | null
          is_active?: boolean
          language?: string | null
          name?: string
          organisation_id?: string
          requirements?: Json | null
          tuition?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_portraits: {
        Row: {
          ai_roadmap: Json | null
          budget_preference: string | null
          consultant_id: string | null
          consultation_balance: number
          created_at: string
          education_level: string | null
          generation_count: number
          gpa: number | null
          id: string
          ielts_score: number | null
          interests: string[] | null
          meta: Json | null
          needs_attention: boolean
          preferred_countries: string[] | null
          skills: string[] | null
          status: string
          toefl_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_roadmap?: Json | null
          budget_preference?: string | null
          consultant_id?: string | null
          consultation_balance?: number
          created_at?: string
          education_level?: string | null
          generation_count?: number
          gpa?: number | null
          id?: string
          ielts_score?: number | null
          interests?: string[] | null
          meta?: Json | null
          needs_attention?: boolean
          preferred_countries?: string[] | null
          skills?: string[] | null
          status?: string
          toefl_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_roadmap?: Json | null
          budget_preference?: string | null
          consultant_id?: string | null
          consultation_balance?: number
          created_at?: string
          education_level?: string | null
          generation_count?: number
          gpa?: number | null
          id?: string
          ielts_score?: number | null
          interests?: string[] | null
          meta?: Json | null
          needs_attention?: boolean
          preferred_countries?: string[] | null
          skills?: string[] | null
          status?: string
          toefl_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      target_programs: {
        Row: {
          application_status: string
          created_at: string
          deadline: string | null
          id: string
          notes: string | null
          program_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_status?: string
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          program_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_status?: string
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          program_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "target_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "consultant" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "consultant", "admin"],
    },
  },
} as const
