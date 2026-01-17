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
          correlation_id: string | null
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
          correlation_id?: string | null
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
          correlation_id?: string | null
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
          correlation_id: string | null
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
          correlation_id?: string | null
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
          correlation_id?: string | null
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
      contracts: {
        Row: {
          contract_number: string
          correlation_id: string | null
          created_at: string
          created_by: string
          description: string | null
          document_url: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          parent_contract_id: string | null
          status: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          terminated_at: string | null
          title: string
          updated_at: string
          version: number
          version_hash: string
        }
        Insert: {
          contract_number: string
          correlation_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          parent_contract_id?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          terminated_at?: string | null
          title: string
          updated_at?: string
          version?: number
          version_hash: string
        }
        Update: {
          contract_number?: string
          correlation_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          parent_contract_id?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id?: string
          terminated_at?: string | null
          title?: string
          updated_at?: string
          version?: number
          version_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_parent_contract_id_fkey"
            columns: ["parent_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string
          export_id: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by: string
          export_id: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          export_id?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_room_access_log_export_id_fkey"
            columns: ["export_id"]
            isOneToOne: false
            referencedRelation: "data_room_exports"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_exports: {
        Row: {
          access_expires_at: string | null
          assigned_auditors: string[] | null
          completed_at: string | null
          content_manifest: Json
          created_at: string
          description: string | null
          error_message: string | null
          export_type: Database["public"]["Enums"]["data_room_export_type"]
          file_hash: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          organization_id: string | null
          period_end: string
          period_start: string
          requested_at: string
          requested_by: string
          scope_type: string
          status: Database["public"]["Enums"]["disclosure_export_status"]
          title: string
          watermark: string
        }
        Insert: {
          access_expires_at?: string | null
          assigned_auditors?: string[] | null
          completed_at?: string | null
          content_manifest?: Json
          created_at?: string
          description?: string | null
          error_message?: string | null
          export_type: Database["public"]["Enums"]["data_room_export_type"]
          file_hash?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          period_end: string
          period_start: string
          requested_at?: string
          requested_by: string
          scope_type: string
          status?: Database["public"]["Enums"]["disclosure_export_status"]
          title: string
          watermark: string
        }
        Update: {
          access_expires_at?: string | null
          assigned_auditors?: string[] | null
          completed_at?: string | null
          content_manifest?: Json
          created_at?: string
          description?: string | null
          error_message?: string | null
          export_type?: Database["public"]["Enums"]["data_room_export_type"]
          file_hash?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          period_end?: string
          period_start?: string
          requested_at?: string
          requested_by?: string
          scope_type?: string
          status?: Database["public"]["Enums"]["disclosure_export_status"]
          title?: string
          watermark?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_room_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      disclosure_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          export_type: Database["public"]["Enums"]["disclosure_export_type"]
          file_name: string | null
          file_url: string | null
          generated_at: string
          generated_by: string
          id: string
          parameters: Json
          record_count: number | null
          status: Database["public"]["Enums"]["disclosure_export_status"]
          watermark: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type: Database["public"]["Enums"]["disclosure_export_type"]
          file_name?: string | null
          file_url?: string | null
          generated_at?: string
          generated_by: string
          id?: string
          parameters?: Json
          record_count?: number | null
          status?: Database["public"]["Enums"]["disclosure_export_status"]
          watermark: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type?: Database["public"]["Enums"]["disclosure_export_type"]
          file_name?: string | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string
          id?: string
          parameters?: Json
          record_count?: number | null
          status?: Database["public"]["Enums"]["disclosure_export_status"]
          watermark?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          license_id: string | null
          quantity: number
          unit_amount: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          license_id?: string | null
          quantity?: number
          unit_amount: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          license_id?: string | null
          quantity?: number
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contract_id: string
          contract_version_hash: string
          correlation_id: string | null
          created_at: string
          created_by: string
          currency: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_at: string | null
          provider_invoice_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal_amount: number
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
          voided_at: string | null
        }
        Insert: {
          contract_id: string
          contract_version_hash: string
          correlation_id?: string | null
          created_at?: string
          created_by: string
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          provider_invoice_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_amount: number
          tax_amount?: number
          tenant_id: string
          total_amount: number
          updated_at?: string
          voided_at?: string | null
        }
        Update: {
          contract_id?: string
          contract_version_hash?: string
          correlation_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          provider_invoice_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_amount?: number
          tax_amount?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
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
          correlation_id: string | null
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
          correlation_id?: string | null
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
          correlation_id?: string | null
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
          correlation_id: string | null
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
          correlation_id?: string | null
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
          correlation_id?: string | null
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
      payments: {
        Row: {
          amount: number
          correlation_id: string | null
          created_at: string
          currency: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          invoice_id: string
          payment_method_last4: string | null
          payment_method_type: string | null
          processed_at: string | null
          provider_charge_id: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          correlation_id?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          invoice_id: string
          payment_method_last4?: string | null
          payment_method_type?: string | null
          processed_at?: string | null
          provider_charge_id?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          correlation_id?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          invoice_id?: string
          payment_method_last4?: string | null
          payment_method_type?: string | null
          processed_at?: string | null
          provider_charge_id?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
      refunds: {
        Row: {
          amount: number
          correlation_id: string | null
          created_at: string
          currency: string
          id: string
          issued_at: string
          issued_by: string
          payment_id: string
          provider_refund_id: string | null
          reason: Database["public"]["Enums"]["refund_reason"]
          reason_description: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          correlation_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          issued_at?: string
          issued_by: string
          payment_id: string
          provider_refund_id?: string | null
          reason: Database["public"]["Enums"]["refund_reason"]
          reason_description?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          correlation_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          issued_at?: string
          issued_by?: string
          payment_id?: string
          provider_refund_id?: string | null
          reason?: Database["public"]["Enums"]["refund_reason"]
          reason_description?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index: {
        Row: {
          content_summary: string | null
          entity_date: string | null
          entity_id: string
          entity_status: string | null
          entity_type: string
          id: string
          indexed_at: string
          search_vector: unknown
          subtitle: string | null
          tenant_id: string | null
          title: string
        }
        Insert: {
          content_summary?: string | null
          entity_date?: string | null
          entity_id: string
          entity_status?: string | null
          entity_type: string
          id?: string
          indexed_at?: string
          search_vector?: unknown
          subtitle?: string | null
          tenant_id?: string | null
          title: string
        }
        Update: {
          content_summary?: string | null
          entity_date?: string | null
          entity_id?: string
          entity_status?: string | null
          entity_type?: string
          id?: string
          indexed_at?: string
          search_vector?: unknown
          subtitle?: string | null
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_index_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      search_query_log: {
        Row: {
          duration_ms: number | null
          entity_types_searched: string[]
          executed_at: string
          id: string
          query_length: number
          result_count: number
          scope_id: string | null
          scope_type: string
          user_id: string
        }
        Insert: {
          duration_ms?: number | null
          entity_types_searched: string[]
          executed_at?: string
          id?: string
          query_length: number
          result_count: number
          scope_id?: string | null
          scope_type: string
          user_id: string
        }
        Update: {
          duration_ms?: number | null
          entity_types_searched?: string[]
          executed_at?: string
          id?: string
          query_length?: number
          result_count?: number
          scope_id?: string | null
          scope_type?: string
          user_id?: string
        }
        Relationships: []
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
      generate_correlation_id: { Args: never; Returns: string }
      get_correlation_chain: {
        Args: { _correlation_id: string }
        Returns: {
          action: string
          actor: string
          details: Json
          event_id: string
          event_timestamp: string
          event_type: string
          record_id: string
          record_type: string
          tenant_id: string
        }[]
      }
      get_payment_lineage: {
        Args: { p_payment_id: string }
        Returns: {
          contract_id: string
          contract_number: string
          contract_version: number
          contract_version_hash: string
          invoice_amount: number
          invoice_id: string
          invoice_number: string
          organization_id: string
          organization_name: string
          payment_amount: number
          payment_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
        }[]
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
      is_external_auditor: { Args: { _user_id: string }; Returns: boolean }
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
      search_entities: {
        Args: {
          p_entity_types?: string[]
          p_limit?: number
          p_query: string
          p_scope_type: string
          p_tenant_id?: string
        }
        Returns: {
          entity_date: string
          entity_id: string
          entity_status: string
          entity_type: string
          rank: number
          subtitle: string
          title: string
        }[]
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
      contract_status: "draft" | "active" | "amended" | "terminated" | "expired"
      data_room_export_type:
        | "authority_governance"
        | "contracts_amendments"
        | "billing_payments"
        | "licensing_activity"
        | "messaging_transcripts"
      disclosure_export_status: "generating" | "completed" | "failed"
      disclosure_export_type:
        | "licensing_activity"
        | "approval_history"
        | "agreement_registry"
      invoice_status: "draft" | "open" | "paid" | "void" | "uncollectible"
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
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      platform_role: "platform_admin" | "platform_user" | "external_auditor"
      portal_context: "publishing" | "licensing"
      portal_role: "tenant_admin" | "tenant_user" | "viewer"
      refund_reason:
        | "duplicate"
        | "fraudulent"
        | "requested_by_customer"
        | "service_not_provided"
        | "other"
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
      contract_status: ["draft", "active", "amended", "terminated", "expired"],
      data_room_export_type: [
        "authority_governance",
        "contracts_amendments",
        "billing_payments",
        "licensing_activity",
        "messaging_transcripts",
      ],
      disclosure_export_status: ["generating", "completed", "failed"],
      disclosure_export_type: [
        "licensing_activity",
        "approval_history",
        "agreement_registry",
      ],
      invoice_status: ["draft", "open", "paid", "void", "uncollectible"],
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
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      platform_role: ["platform_admin", "platform_user", "external_auditor"],
      portal_context: ["publishing", "licensing"],
      portal_role: ["tenant_admin", "tenant_user", "viewer"],
      refund_reason: [
        "duplicate",
        "fraudulent",
        "requested_by_customer",
        "service_not_provided",
        "other",
      ],
    },
  },
} as const
