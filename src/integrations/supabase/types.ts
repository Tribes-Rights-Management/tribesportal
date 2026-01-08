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
          actor_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_email: string | null
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_email?: string | null
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_email?: string | null
          target_id?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          location: string
          message: string
          source_page: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          location: string
          message: string
          source_page?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: string
          message?: string
          source_page?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_url: string | null
          id: string
          request_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_url?: string | null
          id?: string
          request_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          request_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          created_at: string | null
          id: string
          note: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      license_packages: {
        Row: {
          additional_product_info: string | null
          additional_track_info: string | null
          address_city: string | null
          address_country: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          agreement_accounting: boolean | null
          agreement_terms: boolean | null
          appears_multiple_times: boolean | null
          created_at: string | null
          distributor: string | null
          first_name: string | null
          id: string
          label_master_owner: string | null
          last_name: string | null
          license_id: string | null
          licensee_email: string | null
          licensee_legal_name: string | null
          organization: string | null
          package_reference: string | null
          product_upc: string | null
          project_title: string | null
          recording_artist: string | null
          release_date: string | null
          release_title: string | null
          runtime: string | null
          selected_license_types: string[] | null
          song_title: string | null
          status: string
          submitted_at: string | null
          times_count: number | null
          track_artist: string | null
          track_isrc: string | null
          track_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_product_info?: string | null
          additional_track_info?: string | null
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          agreement_accounting?: boolean | null
          agreement_terms?: boolean | null
          appears_multiple_times?: boolean | null
          created_at?: string | null
          distributor?: string | null
          first_name?: string | null
          id?: string
          label_master_owner?: string | null
          last_name?: string | null
          license_id?: string | null
          licensee_email?: string | null
          licensee_legal_name?: string | null
          organization?: string | null
          package_reference?: string | null
          product_upc?: string | null
          project_title?: string | null
          recording_artist?: string | null
          release_date?: string | null
          release_title?: string | null
          runtime?: string | null
          selected_license_types?: string[] | null
          song_title?: string | null
          status?: string
          submitted_at?: string | null
          times_count?: number | null
          track_artist?: string | null
          track_isrc?: string | null
          track_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_product_info?: string | null
          additional_track_info?: string | null
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          agreement_accounting?: boolean | null
          agreement_terms?: boolean | null
          appears_multiple_times?: boolean | null
          created_at?: string | null
          distributor?: string | null
          first_name?: string | null
          id?: string
          label_master_owner?: string | null
          last_name?: string | null
          license_id?: string | null
          licensee_email?: string | null
          licensee_legal_name?: string | null
          organization?: string | null
          package_reference?: string | null
          product_upc?: string | null
          project_title?: string | null
          recording_artist?: string | null
          release_date?: string | null
          release_title?: string | null
          runtime?: string | null
          selected_license_types?: string[] | null
          song_title?: string | null
          status?: string
          submitted_at?: string | null
          times_count?: number | null
          track_artist?: string | null
          track_isrc?: string | null
          track_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      license_types: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string | null
          fee: string | null
          id: string
          is_superseded: boolean | null
          license_id: string
          license_type_code: string
          request_id: string
          status: string
          superseded_by: string | null
          supersession_reason: string | null
          term: string | null
          territory: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee?: string | null
          id?: string
          is_superseded?: boolean | null
          license_id: string
          license_type_code: string
          request_id: string
          status?: string
          superseded_by?: string | null
          supersession_reason?: string | null
          term?: string | null
          territory?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee?: string | null
          id?: string
          is_superseded?: boolean | null
          license_id?: string
          license_type_code?: string
          request_id?: string
          status?: string
          superseded_by?: string | null
          supersession_reason?: string | null
          term?: string | null
          territory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          approved_at: string | null
          approved_by: string | null
          company: string | null
          company_description: string | null
          company_type: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company?: string | null
          company_description?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company?: string | null
          company_description?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      status_history: {
        Row: {
          actor_user_id: string
          created_at: string | null
          from_status: string | null
          id: string
          license_id: string | null
          notes: string | null
          request_id: string
          to_status: string
        }
        Insert: {
          actor_user_id: string
          created_at?: string | null
          from_status?: string | null
          id?: string
          license_id?: string | null
          notes?: string | null
          request_id: string
          to_status: string
        }
        Update: {
          actor_user_id?: string
          created_at?: string | null
          from_status?: string | null
          id?: string
          license_id?: string | null
          notes?: string | null
          request_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_packages"
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
