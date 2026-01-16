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
      access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          id: string
          record_id: string
          record_type: string
          tenant_id: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          id?: string
          record_id: string
          record_type: string
          tenant_id?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          id?: string
          record_id?: string
          record_type?: string
          tenant_id?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      access_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          processed_at: string | null
          processed_by: string | null
          status: Database["public"]["Enums"]["access_request_status"]
          tenant_hint: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["access_request_status"]
          tenant_hint?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["access_request_status"]
          tenant_hint?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          action_label: string
          actor_email: string | null
          actor_id: string | null
          actor_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          record_id: string | null
          record_type: string | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          action_label: string
          actor_email?: string | null
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          record_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          action_label?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          record_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      licensing_agreements: {
        Row: {
          agreement_title: string
          created_at: string
          document_url: string | null
          effective_date: string | null
          end_date: string | null
          id: string
          request_id: string | null
          status: Database["public"]["Enums"]["agreement_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          agreement_title: string
          created_at?: string
          document_url?: string | null
          effective_date?: string | null
          end_date?: string | null
          id?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          agreement_title?: string
          created_at?: string
          document_url?: string | null
          effective_date?: string | null
          end_date?: string | null
          id?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licensing_agreements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "licensing_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licensing_agreements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      licensing_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          requester_email: string | null
          requester_user_id: string | null
          status: Database["public"]["Enums"]["licensing_request_status"]
          tenant_id: string
          term_description: string | null
          territory: string | null
          updated_at: string
          usage_type: string | null
          work_title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          requester_email?: string | null
          requester_user_id?: string | null
          status?: Database["public"]["Enums"]["licensing_request_status"]
          tenant_id: string
          term_description?: string | null
          territory?: string | null
          updated_at?: string
          usage_type?: string | null
          work_title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          requester_email?: string | null
          requester_user_id?: string | null
          status?: Database["public"]["Enums"]["licensing_request_status"]
          tenant_id?: string
          term_description?: string | null
          territory?: string | null
          updated_at?: string
          usage_type?: string | null
          work_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licensing_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_agreements: {
        Row: {
          agreement_title: string
          created_at: string
          document_url: string
          id: string
          status: Database["public"]["Enums"]["agreement_status"]
          tenant_id: string
        }
        Insert: {
          agreement_title: string
          created_at?: string
          document_url: string
          id?: string
          status?: Database["public"]["Enums"]["agreement_status"]
          tenant_id: string
        }
        Update: {
          agreement_title?: string
          created_at?: string
          document_url?: string
          id?: string
          status?: Database["public"]["Enums"]["agreement_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_agreements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_documents: {
        Row: {
          created_at: string
          document_type: string | null
          document_url: string
          id: string
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          document_url: string
          id?: string
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          document_type?: string | null
          document_url?: string
          id?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_statements: {
        Row: {
          created_at: string
          id: string
          statement_period: string
          statement_url: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          statement_period: string
          statement_url: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          statement_period?: string
          statement_url?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_statements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_memberships: {
        Row: {
          allowed_contexts: Database["public"]["Enums"]["portal_context"][]
          created_at: string
          default_context: Database["public"]["Enums"]["portal_context"] | null
          id: string
          role: Database["public"]["Enums"]["portal_role"]
          status: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_contexts?: Database["public"]["Enums"]["portal_context"][]
          created_at?: string
          default_context?: Database["public"]["Enums"]["portal_context"] | null
          id?: string
          role?: Database["public"]["Enums"]["portal_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_contexts?: Database["public"]["Enums"]["portal_context"][]
          created_at?: string
          default_context?: Database["public"]["Enums"]["portal_context"] | null
          id?: string
          role?: Database["public"]["Enums"]["portal_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          platform_role: Database["public"]["Enums"]["platform_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          platform_role?: Database["public"]["Enums"]["platform_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          platform_role?: Database["public"]["Enums"]["platform_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_context: {
        Args: {
          _context: Database["public"]["Enums"]["portal_context"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      can_access_licensing_context: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      can_access_publishing_context: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      get_user_contexts: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["portal_context"][]
      }
      has_active_membership: { Args: { _user_id: string }; Returns: boolean }
      is_active_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_admin: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      log_access_event: {
        Args: {
          _access_type: string
          _record_id: string
          _record_type: string
          _tenant_id?: string
        }
        Returns: string
      }
      log_audit_event: {
        Args: {
          _action: Database["public"]["Enums"]["audit_action"]
          _action_label: string
          _details?: Json
          _record_id?: string
          _record_type?: string
          _tenant_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      access_request_status: "pending" | "processed"
      agreement_status: "draft" | "active" | "expired" | "terminated"
      audit_action:
        | "record_created"
        | "record_updated"
        | "record_approved"
        | "record_rejected"
        | "access_granted"
        | "access_revoked"
        | "export_generated"
        | "document_uploaded"
        | "document_removed"
        | "login"
        | "logout"
        | "record_viewed"
      licensing_request_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "cancelled"
      membership_status:
        | "pending"
        | "active"
        | "denied"
        | "revoked"
        | "suspended"
      platform_role: "platform_admin" | "platform_user"
      portal_context: "publishing" | "licensing"
      portal_role: "tenant_admin" | "tenant_user" | "viewer"
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
      access_request_status: ["pending", "processed"],
      agreement_status: ["draft", "active", "expired", "terminated"],
      audit_action: [
        "record_created",
        "record_updated",
        "record_approved",
        "record_rejected",
        "access_granted",
        "access_revoked",
        "export_generated",
        "document_uploaded",
        "document_removed",
        "login",
        "logout",
        "record_viewed",
      ],
      licensing_request_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      membership_status: [
        "pending",
        "active",
        "denied",
        "revoked",
        "suspended",
      ],
      platform_role: ["platform_admin", "platform_user"],
      portal_context: ["publishing", "licensing"],
      portal_role: ["tenant_admin", "tenant_user", "viewer"],
    },
  },
} as const
