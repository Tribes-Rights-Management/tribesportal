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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          ip_address: unknown
          message: string
          name: string
          processed: boolean | null
          processed_at: string | null
          processed_by: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          message: string
          name: string
          processed?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          message?: string
          name?: string
          processed?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      context_permissions: {
        Row: {
          allowed: boolean
          context: Database["public"]["Enums"]["portal_context"]
          created_at: string
          id: string
          role: Database["public"]["Enums"]["portal_role"]
        }
        Insert: {
          allowed?: boolean
          context: Database["public"]["Enums"]["portal_context"]
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["portal_role"]
        }
        Update: {
          allowed?: boolean
          context?: Database["public"]["Enums"]["portal_context"]
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["portal_role"]
        }
        Relationships: []
      }
      data_catalog_columns: {
        Row: {
          column_name: string
          created_at: string
          description: string | null
          id: string
          is_encrypted: boolean | null
          sensitivity_tag: Database["public"]["Enums"]["sensitivity_tag"]
          table_name: string
          table_schema: string
          updated_at: string
        }
        Insert: {
          column_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          sensitivity_tag?: Database["public"]["Enums"]["sensitivity_tag"]
          table_name: string
          table_schema?: string
          updated_at?: string
        }
        Update: {
          column_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          sensitivity_tag?: Database["public"]["Enums"]["sensitivity_tag"]
          table_name?: string
          table_schema?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_catalog_tables: {
        Row: {
          classification_level: Database["public"]["Enums"]["classification_level"]
          contains_pii: boolean | null
          created_at: string
          description: string | null
          id: string
          legal_hold: boolean | null
          owner: string | null
          retention_class: Database["public"]["Enums"]["retention_class"]
          table_name: string
          table_schema: string
          updated_at: string
        }
        Insert: {
          classification_level?: Database["public"]["Enums"]["classification_level"]
          contains_pii?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          legal_hold?: boolean | null
          owner?: string | null
          retention_class?: Database["public"]["Enums"]["retention_class"]
          table_name: string
          table_schema?: string
          updated_at?: string
        }
        Update: {
          classification_level?: Database["public"]["Enums"]["classification_level"]
          contains_pii?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          legal_hold?: boolean | null
          owner?: string | null
          retention_class?: Database["public"]["Enums"]["retention_class"]
          table_name?: string
          table_schema?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          context: string | null
          created_at: string
          description: string | null
          document_type: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          tenant_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      license_requests: {
        Row: {
          created_at: string
          description: string | null
          fee_proposed: number | null
          id: string
          notes: string | null
          requester_id: string
          status: string
          tenant_id: string
          term_end: string | null
          term_start: string | null
          territory: string | null
          title: string
          updated_at: string
          usage_type: string | null
          work_ids: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fee_proposed?: number | null
          id?: string
          notes?: string | null
          requester_id: string
          status?: string
          tenant_id: string
          term_end?: string | null
          term_start?: string | null
          territory?: string | null
          title: string
          updated_at?: string
          usage_type?: string | null
          work_ids?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fee_proposed?: number | null
          id?: string
          notes?: string | null
          requester_id?: string
          status?: string
          tenant_id?: string
          term_end?: string | null
          term_start?: string | null
          territory?: string | null
          title?: string
          updated_at?: string
          usage_type?: string | null
          work_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "license_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string
          document_url: string | null
          fee: number | null
          id: string
          issued_at: string | null
          license_request_id: string | null
          licensee_email: string | null
          licensee_name: string
          notes: string | null
          status: string
          tenant_id: string
          term_end: string | null
          term_start: string
          territory: string
          updated_at: string
          usage_type: string
          work_ids: string[] | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          fee?: number | null
          id?: string
          issued_at?: string | null
          license_request_id?: string | null
          licensee_email?: string | null
          licensee_name: string
          notes?: string | null
          status?: string
          tenant_id: string
          term_end?: string | null
          term_start: string
          territory?: string
          updated_at?: string
          usage_type: string
          work_ids?: string[] | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          fee?: number | null
          id?: string
          issued_at?: string | null
          license_request_id?: string | null
          licensee_email?: string | null
          licensee_name?: string
          notes?: string | null
          status?: string
          tenant_id?: string
          term_end?: string | null
          term_start?: string
          territory?: string
          updated_at?: string
          usage_type?: string
          work_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_license_request_id_fkey"
            columns: ["license_request_id"]
            isOneToOne: false
            referencedRelation: "license_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_roles: {
        Row: {
          created_at: string
          id: string
          membership_id: string
          role: Database["public"]["Enums"]["portal_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          membership_id: string
          role: Database["public"]["Enums"]["portal_role"]
        }
        Update: {
          created_at?: string
          id?: string
          membership_id?: string
          role?: Database["public"]["Enums"]["portal_role"]
        }
        Relationships: [
          {
            foreignKeyName: "membership_roles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "tenant_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          paid_at: string | null
          payee_name: string
          payment_method: string | null
          reference_number: string | null
          statement_id: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payee_name: string
          payment_method?: string | null
          reference_number?: string | null
          statement_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payee_name?: string
          payment_method?: string | null
          reference_number?: string | null
          statement_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          notes: string | null
          registration_number: string | null
          society_code: string
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
          work_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          registration_number?: string | null
          society_code: string
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
          work_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          registration_number?: string | null
          society_code?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      splits: {
        Row: {
          created_at: string
          effective_date: string | null
          id: string
          ipi_number: string | null
          notes: string | null
          ownership_percentage: number
          party_name: string
          party_role: string
          pro_affiliation: string | null
          tenant_id: string
          updated_at: string
          work_id: string
        }
        Insert: {
          created_at?: string
          effective_date?: string | null
          id?: string
          ipi_number?: string | null
          notes?: string | null
          ownership_percentage: number
          party_name: string
          party_role: string
          pro_affiliation?: string | null
          tenant_id: string
          updated_at?: string
          work_id: string
        }
        Update: {
          created_at?: string
          effective_date?: string | null
          id?: string
          ipi_number?: string | null
          notes?: string | null
          ownership_percentage?: number
          party_name?: string
          party_role?: string
          pro_affiliation?: string | null
          tenant_id?: string
          updated_at?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "splits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "splits_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      statements: {
        Row: {
          created_at: string
          currency: string
          document_url: string | null
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          period_end: string
          period_start: string
          source: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          document_url?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          period_end: string
          period_start: string
          source: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          document_url?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          source?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "statements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_memberships: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          membership_role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          membership_role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          membership_role?: Database["public"]["Enums"]["membership_role"]
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
      tenant_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          pinned: boolean | null
          tenant_id: string
          title: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          pinned?: boolean | null
          tenant_id: string
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_notes_tenant_id_fkey"
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
          deleted_at: string | null
          deletion_eligible_at: string | null
          id: string
          legal_hold: boolean | null
          legal_name: string
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deletion_eligible_at?: string | null
          id?: string
          legal_hold?: boolean | null
          legal_name: string
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deletion_eligible_at?: string | null
          id?: string
          legal_hold?: boolean | null
          legal_name?: string
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          default_context: Database["public"]["Enums"]["portal_context"] | null
          default_tenant_id: string | null
          deleted_at: string | null
          deletion_eligible_at: string | null
          email: string
          id: string
          last_login_at: string | null
          legal_hold: boolean | null
          status: Database["public"]["Enums"]["user_status"]
        }
        Insert: {
          created_at?: string
          default_context?: Database["public"]["Enums"]["portal_context"] | null
          default_tenant_id?: string | null
          deleted_at?: string | null
          deletion_eligible_at?: string | null
          email: string
          id: string
          last_login_at?: string | null
          legal_hold?: boolean | null
          status?: Database["public"]["Enums"]["user_status"]
        }
        Update: {
          created_at?: string
          default_context?: Database["public"]["Enums"]["portal_context"] | null
          default_tenant_id?: string | null
          deleted_at?: string | null
          deletion_eligible_at?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          legal_hold?: boolean | null
          status?: Database["public"]["Enums"]["user_status"]
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_default_tenant_id_fkey"
            columns: ["default_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          alternate_titles: string[] | null
          created_at: string
          duration_seconds: number | null
          genre: string | null
          id: string
          iswc: string | null
          language: string | null
          metadata: Json | null
          release_date: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          alternate_titles?: string[] | null
          created_at?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          iswc?: string | null
          language?: string | null
          metadata?: Json | null
          release_date?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          alternate_titles?: string[] | null
          created_at?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          iswc?: string | null
          language?: string | null
          metadata?: Json | null
          release_date?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "works_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      can_manage_memberships: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      get_membership_roles: {
        Args: { _membership_id: string }
        Returns: Database["public"]["Enums"]["portal_role"][]
      }
      get_user_contexts: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["portal_context"][]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_tenant_ids: { Args: { _user_id: string }; Returns: string[] }
      has_any_tenant_role: {
        Args: {
          p_roles: Database["public"]["Enums"]["portal_role"][]
          p_tenant_id: string
        }
        Returns: boolean
      }
      has_portal_role: {
        Args: {
          _role: Database["public"]["Enums"]["portal_role"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      has_publishing_access: { Args: { p_tenant_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tenant_access: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      has_tenant_role: {
        Args: {
          p_role: Database["public"]["Enums"]["portal_role"]
          p_tenant_id: string
        }
        Returns: boolean
      }
      is_active_member: { Args: { p_tenant_id: string }; Returns: boolean }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_admin: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      classification_level:
        | "public"
        | "internal"
        | "confidential"
        | "restricted"
      membership_role: "admin" | "member" | "viewer"
      membership_status: "active" | "suspended" | "invited"
      portal_context: "licensing" | "publishing"
      portal_role:
        | "tenant_owner"
        | "publishing_admin"
        | "licensing_user"
        | "read_only"
        | "internal_admin"
      retention_class:
        | "transient"
        | "short_term"
        | "standard"
        | "long_term"
        | "permanent"
      sensitivity_tag:
        | "none"
        | "pii"
        | "financial"
        | "credentials"
        | "proprietary"
      tenant_status: "active" | "suspended"
      user_role: "admin" | "client" | "licensing"
      user_status: "active" | "suspended"
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
      classification_level: [
        "public",
        "internal",
        "confidential",
        "restricted",
      ],
      membership_role: ["admin", "member", "viewer"],
      membership_status: ["active", "suspended", "invited"],
      portal_context: ["licensing", "publishing"],
      portal_role: [
        "tenant_owner",
        "publishing_admin",
        "licensing_user",
        "read_only",
        "internal_admin",
      ],
      retention_class: [
        "transient",
        "short_term",
        "standard",
        "long_term",
        "permanent",
      ],
      sensitivity_tag: [
        "none",
        "pii",
        "financial",
        "credentials",
        "proprietary",
      ],
      tenant_status: ["active", "suspended"],
      user_role: ["admin", "client", "licensing"],
      user_status: ["active", "suspended"],
    },
  },
} as const
