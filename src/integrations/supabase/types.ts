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
      ai_agent_config: {
        Row: {
          config_key: string
          config_value: string
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_access_logs: {
        Row: {
          accessed_at: string
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          response_status: number
          response_time_ms: number | null
          scope_type: string
          tenant_id: string | null
          token_id: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          response_status: number
          response_time_ms?: number | null
          scope_type: string
          tenant_id?: string | null
          token_id: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          response_status?: number
          response_time_ms?: number | null
          scope_type?: string
          tenant_id?: string | null
          token_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_access_logs_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      api_tokens: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string
          granted_by: string
          granted_to_email: string
          id: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          revoked_by: string | null
          scope: Database["public"]["Enums"]["api_token_scope"]
          status: Database["public"]["Enums"]["api_token_status"]
          tenant_id: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at: string
          granted_by: string
          granted_to_email: string
          id?: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          revoked_by?: string | null
          scope: Database["public"]["Enums"]["api_token_scope"]
          status?: Database["public"]["Enums"]["api_token_status"]
          tenant_id?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string
          granted_by?: string
          granted_to_email?: string
          id?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          revoked_by?: string | null
          scope?: Database["public"]["Enums"]["api_token_scope"]
          status?: Database["public"]["Enums"]["api_token_status"]
          tenant_id?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          body: string
          category_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          meta_description: string | null
          not_helpful_count: number | null
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          body: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          meta_description?: string | null
          not_helpful_count?: number | null
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          body?: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          meta_description?: string | null
          not_helpful_count?: number | null
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      backup_manifests: {
        Row: {
          backup_id: string
          backup_type: string
          created_at: string
          created_by: string
          file_hash: string
          file_size_bytes: number
          id: string
          record_counts: Json
          tables_included: string[]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          backup_id: string
          backup_type: string
          created_at?: string
          created_by: string
          file_hash: string
          file_size_bytes: number
          id?: string
          record_counts: Json
          tables_included: string[]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          backup_id?: string
          backup_type?: string
          created_at?: string
          created_by?: string
          file_hash?: string
          file_size_bytes?: number
          id?: string
          record_counts?: Json
          tables_included?: string[]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          article_references: Json | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          article_references?: Json | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          article_references?: Json | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_account_members: {
        Row: {
          accepted_at: string | null
          can_download_exports: boolean
          can_manage_team: boolean
          can_submit_songs: boolean
          can_view_contracts: boolean
          client_account_id: string
          created_at: string
          id: string
          invited_by: string | null
          removed_at: string | null
          role: Database["public"]["Enums"]["client_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          can_download_exports?: boolean
          can_manage_team?: boolean
          can_submit_songs?: boolean
          can_view_contracts?: boolean
          client_account_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          removed_at?: string | null
          role?: Database["public"]["Enums"]["client_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          can_download_exports?: boolean
          can_manage_team?: boolean
          can_submit_songs?: boolean
          can_view_contracts?: boolean
          client_account_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          removed_at?: string | null
          role?: Database["public"]["Enums"]["client_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_account_members_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_accounts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          archived_at: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          primary_email: string | null
          state_province: string | null
          status: Database["public"]["Enums"]["client_account_status"]
          trolley_recipient_id: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          archived_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_email?: string | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["client_account_status"]
          trolley_recipient_id?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          archived_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_email?: string | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["client_account_status"]
          trolley_recipient_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          client_account_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          role: string | null
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_account_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: string | null
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_account_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_ipi_numbers: {
        Row: {
          client_account_id: string
          created_at: string
          id: string
          ipi_number: string
          is_primary: boolean
          party_name: string
          party_type: Database["public"]["Enums"]["interested_party_type"]
          pro_id: string | null
          updated_at: string
        }
        Insert: {
          client_account_id: string
          created_at?: string
          id?: string
          ipi_number: string
          is_primary?: boolean
          party_name: string
          party_type: Database["public"]["Enums"]["interested_party_type"]
          pro_id?: string | null
          updated_at?: string
        }
        Update: {
          client_account_id?: string
          created_at?: string
          id?: string
          ipi_number?: string
          is_primary?: boolean
          party_name?: string
          party_type?: Database["public"]["Enums"]["interested_party_type"]
          pro_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_ipi_numbers_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ipi_numbers_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pro_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          created_at: string
          deactivated_at: string | null
          display_name: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["company_user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contract_associations: {
        Row: {
          client_account_id: string
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          is_signatory: boolean
          signature_required: boolean
          signed_at: string | null
        }
        Insert: {
          client_account_id: string
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_signatory?: boolean
          signature_required?: boolean
          signed_at?: string | null
        }
        Update: {
          client_account_id?: string
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_signatory?: boolean
          signature_required?: boolean
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_associations_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_associations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
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
      escalation_events: {
        Row: {
          escalated_at: string
          escalated_to_role: Database["public"]["Enums"]["platform_role"]
          escalation_rule_id: string
          id: string
          notes: string | null
          notification_id: string
          original_recipient_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["escalation_status"]
        }
        Insert: {
          escalated_at?: string
          escalated_to_role: Database["public"]["Enums"]["platform_role"]
          escalation_rule_id: string
          id?: string
          notes?: string | null
          notification_id: string
          original_recipient_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["escalation_status"]
        }
        Update: {
          escalated_at?: string
          escalated_to_role?: Database["public"]["Enums"]["platform_role"]
          escalation_rule_id?: string
          id?: string
          notes?: string | null
          notification_id?: string
          original_recipient_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["escalation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "escalation_events_escalation_rule_id_fkey"
            columns: ["escalation_rule_id"]
            isOneToOne: false
            referencedRelation: "escalation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_events_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          created_at: string
          created_by: string
          escalation_target_role: Database["public"]["Enums"]["platform_role"]
          id: string
          is_active: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: Database["public"]["Enums"]["notification_priority"]
          sla_minutes: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          escalation_target_role: Database["public"]["Enums"]["platform_role"]
          id?: string
          is_active?: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: Database["public"]["Enums"]["notification_priority"]
          sla_minutes?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          escalation_target_role?: Database["public"]["Enums"]["platform_role"]
          id?: string
          is_active?: boolean
          notification_type?: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          sla_minutes?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      help_article_audiences: {
        Row: {
          article_id: string
          audience_id: string
          category_id: string
          content_override: string | null
          created_at: string | null
          id: string
          position: number
          title_override: string | null
        }
        Insert: {
          article_id: string
          audience_id: string
          category_id: string
          content_override?: string | null
          created_at?: string | null
          id?: string
          position?: number
          title_override?: string | null
        }
        Update: {
          article_id?: string
          audience_id?: string
          category_id?: string
          content_override?: string | null
          created_at?: string | null
          id?: string
          position?: number
          title_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_article_audiences_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_audiences_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "v_help_articles_by_audience"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "help_article_audiences_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "help_audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_audiences_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "v_help_articles_by_audience"
            referencedColumns: ["audience_id"]
          },
          {
            foreignKeyName: "help_article_audiences_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "v_help_categories_by_audience"
            referencedColumns: ["audience_id"]
          },
          {
            foreignKeyName: "help_article_audiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_audiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_help_articles_by_audience"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "help_article_audiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_help_categories_by_audience"
            referencedColumns: ["category_id"]
          },
        ]
      }
      help_articles: {
        Row: {
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          not_helpful_count: number | null
          published_at: string | null
          search_vector: unknown
          slug: string
          status: Database["public"]["Enums"]["help_article_status"]
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          published_at?: string | null
          search_vector?: unknown
          slug: string
          status?: Database["public"]["Enums"]["help_article_status"]
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          status?: Database["public"]["Enums"]["help_article_status"]
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      help_audiences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          position: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          position?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      help_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      help_category_audiences: {
        Row: {
          audience_id: string
          category_id: string
          created_at: string | null
          id: string
          position: number
        }
        Insert: {
          audience_id: string
          category_id: string
          created_at?: string | null
          id?: string
          position?: number
        }
        Update: {
          audience_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "help_category_audiences_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "help_audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_category_audiences_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "v_help_articles_by_audience"
            referencedColumns: ["audience_id"]
          },
          {
            foreignKeyName: "help_category_audiences_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "v_help_categories_by_audience"
            referencedColumns: ["audience_id"]
          },
          {
            foreignKeyName: "help_category_audiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_category_audiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_help_articles_by_audience"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "help_category_audiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_help_categories_by_audience"
            referencedColumns: ["category_id"]
          },
        ]
      }
      interested_parties: {
        Row: {
          client_account_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          party_type: Database["public"]["Enums"]["interested_party_type"]
          pro_id: string | null
          updated_at: string
        }
        Insert: {
          client_account_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          party_type: Database["public"]["Enums"]["interested_party_type"]
          pro_id?: string | null
          updated_at?: string
        }
        Update: {
          client_account_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          party_type?: Database["public"]["Enums"]["interested_party_type"]
          pro_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interested_parties_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interested_parties_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pro_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interested_party_ipi_numbers: {
        Row: {
          created_at: string
          id: string
          interested_party_id: string
          ipi_number: string
          is_primary: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interested_party_id: string
          ipi_number: string
          is_primary?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interested_party_id?: string
          ipi_number?: string
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interested_party_ipi_numbers_interested_party_id_fkey"
            columns: ["interested_party_id"]
            isOneToOne: false
            referencedRelation: "interested_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          admin_access_level: Database["public"]["Enums"]["access_level"] | null
          created_at: string
          expires_at: string
          grant_admin_module: boolean
          grant_licensing_module: boolean
          id: string
          invited_by_user_id: string
          invited_email: string
          licensing_access_level:
            | Database["public"]["Enums"]["access_level"]
            | null
          org_role: Database["public"]["Enums"]["org_role"]
          organization_id: string
          revoked_at: string | null
          revoked_by: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          admin_access_level?:
            | Database["public"]["Enums"]["access_level"]
            | null
          created_at?: string
          expires_at: string
          grant_admin_module?: boolean
          grant_licensing_module?: boolean
          id?: string
          invited_by_user_id: string
          invited_email: string
          licensing_access_level?:
            | Database["public"]["Enums"]["access_level"]
            | null
          org_role?: Database["public"]["Enums"]["org_role"]
          organization_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          admin_access_level?:
            | Database["public"]["Enums"]["access_level"]
            | null
          created_at?: string
          expires_at?: string
          grant_admin_module?: boolean
          grant_licensing_module?: boolean
          id?: string
          invited_by_user_id?: string
          invited_email?: string
          licensing_access_level?:
            | Database["public"]["Enums"]["access_level"]
            | null
          org_role?: Database["public"]["Enums"]["org_role"]
          organization_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      licensing_access_requests: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          notes: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          referrer_url: string | null
          responded_at: string | null
          response_body: string | null
          search_query: string | null
          searched_articles: Json | null
          status: string | null
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          referrer_url?: string | null
          responded_at?: string | null
          response_body?: string | null
          search_query?: string | null
          searched_articles?: Json | null
          status?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          referrer_url?: string | null
          responded_at?: string | null
          response_body?: string | null
          search_query?: string | null
          searched_articles?: Json | null
          status?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      module_access: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          module: Database["public"]["Enums"]["module_type"]
          organization_id: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          module: Database["public"]["Enums"]["module_type"]
          organization_id: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          module?: Database["public"]["Enums"]["module_type"]
          organization_id?: string
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_access_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_archive: {
        Row: {
          acknowledged_at: string | null
          archived_at: string
          correlation_id: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          recipient_id: string
          record_id: string | null
          record_type: string | null
          requires_resolution: boolean
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          retention_category: string
          tenant_id: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          archived_at?: string
          correlation_id?: string | null
          created_at: string
          id: string
          message: string
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          recipient_id: string
          record_id?: string | null
          record_type?: string | null
          requires_resolution?: boolean
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retention_category?: string
          tenant_id?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          archived_at?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          recipient_id?: string
          record_id?: string | null
          record_type?: string | null
          requires_resolution?: boolean
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retention_category?: string
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_archive_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          acknowledged_at: string | null
          archived_at: string | null
          correlation_id: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          recipient_id: string
          record_id: string | null
          record_type: string | null
          requires_resolution: boolean
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          retention_category: string
          tenant_id: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          archived_at?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          recipient_id: string
          record_id?: string | null
          record_type?: string | null
          requires_resolution?: boolean
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retention_category?: string
          tenant_id?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          archived_at?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          recipient_id?: string
          record_id?: string | null
          record_type?: string | null
          requires_resolution?: boolean
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retention_category?: string
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
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
      platform_user_capabilities: {
        Row: {
          can_manage_help: boolean
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          can_manage_help?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          can_manage_help?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
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
      pro_organizations: {
        Row: {
          abbreviation: string
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          abbreviation: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          abbreviation?: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      publishers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          dba_name: string | null
          email: string | null
          id: string
          ipi_number: string | null
          is_active: boolean | null
          is_controlled: boolean | null
          isni: string | null
          legal_name: string | null
          mechanical_society: string | null
          mechanical_society_id: string | null
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          pro: string | null
          pro_member_id: string | null
          publisher_type: string | null
          state: string | null
          territories: string[] | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          dba_name?: string | null
          email?: string | null
          id?: string
          ipi_number?: string | null
          is_active?: boolean | null
          is_controlled?: boolean | null
          isni?: string | null
          legal_name?: string | null
          mechanical_society?: string | null
          mechanical_society_id?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          pro?: string | null
          pro_member_id?: string | null
          publisher_type?: string | null
          state?: string | null
          territories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          dba_name?: string | null
          email?: string | null
          id?: string
          ipi_number?: string | null
          is_active?: boolean | null
          is_controlled?: boolean | null
          isni?: string | null
          legal_name?: string | null
          mechanical_society?: string | null
          mechanical_society_id?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          pro?: string | null
          pro_member_id?: string | null
          publisher_type?: string | null
          state?: string | null
          territories?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recovery_events: {
        Row: {
          backup_id: string | null
          completed_at: string | null
          details: Json | null
          error_message: string | null
          event_type: Database["public"]["Enums"]["recovery_event_type"]
          id: string
          initiated_by: string
          restore_point: string | null
          started_at: string
          status: string
          target_tables: string[]
        }
        Insert: {
          backup_id?: string | null
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          event_type: Database["public"]["Enums"]["recovery_event_type"]
          id?: string
          initiated_by: string
          restore_point?: string | null
          started_at?: string
          status?: string
          target_tables: string[]
        }
        Update: {
          backup_id?: string | null
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          event_type?: Database["public"]["Enums"]["recovery_event_type"]
          id?: string
          initiated_by?: string
          restore_point?: string | null
          started_at?: string
          status?: string
          target_tables?: string[]
        }
        Relationships: []
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
      searches: {
        Row: {
          article_clicked_id: string | null
          converted_to_message: boolean | null
          created_at: string | null
          id: string
          query: string
          results_count: number | null
          session_id: string | null
        }
        Insert: {
          article_clicked_id?: string | null
          converted_to_message?: boolean | null
          created_at?: string | null
          id?: string
          query: string
          results_count?: number | null
          session_id?: string | null
        }
        Update: {
          article_clicked_id?: string | null
          converted_to_message?: boolean | null
          created_at?: string | null
          id?: string
          query?: string
          results_count?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "searches_article_clicked_id_fkey"
            columns: ["article_clicked_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      song_interested_parties: {
        Row: {
          controlled: boolean
          created_at: string
          id: string
          interested_party_id: string
          role: Database["public"]["Enums"]["interested_party_type"]
          share_percentage: number | null
          song_id: string
          territory: string | null
          updated_at: string
        }
        Insert: {
          controlled?: boolean
          created_at?: string
          id?: string
          interested_party_id: string
          role: Database["public"]["Enums"]["interested_party_type"]
          share_percentage?: number | null
          song_id: string
          territory?: string | null
          updated_at?: string
        }
        Update: {
          controlled?: boolean
          created_at?: string
          id?: string
          interested_party_id?: string
          role?: Database["public"]["Enums"]["interested_party_type"]
          share_percentage?: number | null
          song_id?: string
          territory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_interested_parties_interested_party_id_fkey"
            columns: ["interested_party_id"]
            isOneToOne: false
            referencedRelation: "interested_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_interested_parties_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_ownership: {
        Row: {
          administrator_entity_id: string | null
          administrator_id: string | null
          controlled: boolean
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          notes: string | null
          ownership_percentage: number
          publisher_id: string
          song_id: string
          song_writer_id: string | null
          territory: string | null
          tribes_administered: boolean
          updated_at: string
        }
        Insert: {
          administrator_entity_id?: string | null
          administrator_id?: string | null
          controlled?: boolean
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          notes?: string | null
          ownership_percentage?: number
          publisher_id: string
          song_id: string
          song_writer_id?: string | null
          territory?: string | null
          tribes_administered?: boolean
          updated_at?: string
        }
        Update: {
          administrator_entity_id?: string | null
          administrator_id?: string | null
          controlled?: boolean
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          notes?: string | null
          ownership_percentage?: number
          publisher_id?: string
          song_id?: string
          song_writer_id?: string | null
          territory?: string | null
          tribes_administered?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_ownership_administrator_entity_id_fkey"
            columns: ["administrator_entity_id"]
            isOneToOne: false
            referencedRelation: "tribes_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_ownership_administrator_id_fkey"
            columns: ["administrator_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_ownership_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_ownership_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_ownership_song_writer_id_fkey"
            columns: ["song_writer_id"]
            isOneToOne: false
            referencedRelation: "song_writers"
            referencedColumns: ["id"]
          },
        ]
      }
      song_publishers: {
        Row: {
          administered_by: string | null
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          ownership_percentage: number
          publisher_id: string
          publisher_role: string | null
          song_id: string
          territory: string | null
          updated_at: string | null
        }
        Insert: {
          administered_by?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          ownership_percentage?: number
          publisher_id: string
          publisher_role?: string | null
          song_id: string
          territory?: string | null
          updated_at?: string | null
        }
        Update: {
          administered_by?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          ownership_percentage?: number
          publisher_id?: string
          publisher_role?: string | null
          song_id?: string
          territory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_publishers_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_publishers_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_publishers_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_queue: {
        Row: {
          admin_notes: string | null
          approved_song_id: string | null
          client_account_id: string | null
          current_data: Json
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_request: string | null
          revision_requested_at: string | null
          revision_requested_by: string | null
          revision_submitted_at: string | null
          status: Database["public"]["Enums"]["song_queue_status"]
          submitted_at: string
          submitted_by: string
          submitted_data: Json
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_song_id?: string | null
          client_account_id?: string | null
          current_data: Json
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_request?: string | null
          revision_requested_at?: string | null
          revision_requested_by?: string | null
          revision_submitted_at?: string | null
          status?: Database["public"]["Enums"]["song_queue_status"]
          submitted_at?: string
          submitted_by: string
          submitted_data: Json
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_song_id?: string | null
          client_account_id?: string | null
          current_data?: Json
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_request?: string | null
          revision_requested_at?: string | null
          revision_requested_by?: string | null
          revision_submitted_at?: string | null
          status?: Database["public"]["Enums"]["song_queue_status"]
          submitted_at?: string
          submitted_by?: string
          submitted_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_queue_approved_song_id_fkey"
            columns: ["approved_song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_queue_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      song_queue_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          queue_id: string
          sender_id: string
          sender_role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          queue_id: string
          sender_id: string
          sender_role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          queue_id?: string
          sender_id?: string
          sender_role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_queue_messages_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "song_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      song_versions: {
        Row: {
          alternate_titles: string[] | null
          change_summary: string | null
          changed_at: string
          changed_by: string | null
          id: string
          interested_parties_snapshot: Json
          iswc: string | null
          metadata: Json
          song_id: string
          title: string
          version_number: number
        }
        Insert: {
          alternate_titles?: string[] | null
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          interested_parties_snapshot: Json
          iswc?: string | null
          metadata: Json
          song_id: string
          title: string
          version_number: number
        }
        Update: {
          alternate_titles?: string[] | null
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          interested_parties_snapshot?: Json
          iswc?: string | null
          metadata?: Json
          song_id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_versions_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_visibility_overrides: {
        Row: {
          client_account_id: string
          grant_visibility: boolean
          granted_at: string
          granted_by: string | null
          id: string
          reason: string | null
          song_id: string
        }
        Insert: {
          client_account_id: string
          grant_visibility: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          reason?: string | null
          song_id: string
        }
        Update: {
          client_account_id?: string
          grant_visibility?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          reason?: string | null
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_visibility_overrides_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_visibility_overrides_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_writers: {
        Row: {
          created_at: string | null
          credit: string | null
          id: string
          share: number
          song_id: string
          tribes_administered: boolean
          updated_at: string | null
          writer_id: string
        }
        Insert: {
          created_at?: string | null
          credit?: string | null
          id?: string
          share?: number
          song_id: string
          tribes_administered?: boolean
          updated_at?: string | null
          writer_id: string
        }
        Update: {
          created_at?: string | null
          credit?: string | null
          id?: string
          share?: number
          song_id?: string
          tribes_administered?: boolean
          updated_at?: string | null
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_writers_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_writers_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "writers"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          alternate_titles: string[] | null
          ccli_song_id: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          genre: string | null
          id: string
          is_active: boolean
          iswc: string | null
          language: string | null
          metadata: Json
          published_at: string | null
          published_by: string | null
          release_date: string | null
          source_queue_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          alternate_titles?: string[] | null
          ccli_song_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean
          iswc?: string | null
          language?: string | null
          metadata?: Json
          published_at?: string | null
          published_by?: string | null
          release_date?: string | null
          source_queue_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          alternate_titles?: string[] | null
          ccli_song_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean
          iswc?: string | null
          language?: string | null
          metadata?: Json
          published_at?: string | null
          published_by?: string | null
          release_date?: string | null
          source_queue_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          body: string
          created_at: string | null
          from_email: string
          from_name: string | null
          id: string
          mailgun_message_id: string | null
          metadata: Json | null
          priority: string | null
          search_query: string | null
          searched_articles: Json | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          mailgun_message_id?: string | null
          metadata?: Json | null
          priority?: string | null
          search_query?: string | null
          searched_articles?: Json | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          mailgun_message_id?: string | null
          metadata?: Json | null
          priority?: string | null
          search_query?: string | null
          searched_articles?: Json | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_prompts: {
        Row: {
          created_at: string | null
          examples: Json | null
          id: string
          is_active: boolean | null
          performance_notes: string | null
          prompt_key: string
          prompt_text: string
          version: number
        }
        Insert: {
          created_at?: string | null
          examples?: Json | null
          id?: string
          is_active?: boolean | null
          performance_notes?: string | null
          prompt_key: string
          prompt_text: string
          version?: number
        }
        Update: {
          created_at?: string | null
          examples?: Json | null
          id?: string
          is_active?: boolean | null
          performance_notes?: string | null
          prompt_key?: string
          prompt_text?: string
          version?: number
        }
        Relationships: []
      }
      tenant_memberships: {
        Row: {
          allowed_contexts: Database["public"]["Enums"]["portal_context"][]
          created_at: string
          default_context: Database["public"]["Enums"]["portal_context"] | null
          id: string
          org_role: Database["public"]["Enums"]["org_role"] | null
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
          org_role?: Database["public"]["Enums"]["org_role"] | null
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
          org_role?: Database["public"]["Enums"]["org_role"] | null
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
      tenant_ui_policies: {
        Row: {
          tenant_id: string
          ui_density_policy: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          tenant_id: string
          ui_density_policy?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          tenant_id?: string
          ui_density_policy?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_ui_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
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
      ticket_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mailgun_message_id: string | null
          metadata: Json | null
          role: string
          ticket_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mailgun_message_id?: string | null
          metadata?: Json | null
          role: string
          ticket_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mailgun_message_id?: string | null
          metadata?: Json | null
          role?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tribes_entities: {
        Row: {
          created_at: string
          entity_name: string
          id: string
          ipi_number: string
          is_active: boolean
          pro: string
        }
        Insert: {
          created_at?: string
          entity_name: string
          id?: string
          ipi_number: string
          is_active?: boolean
          pro: string
        }
        Update: {
          created_at?: string
          entity_name?: string
          id?: string
          ipi_number?: string
          is_active?: boolean
          pro?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          date_format: string
          display_name: string | null
          id: string
          inactivity_timeout_minutes: number
          notify_email_product_updates: boolean
          notify_email_security_alerts: boolean
          notify_email_team_changes: boolean
          notify_email_workspace_invites: boolean
          security_idle_timeout_enabled: boolean
          security_reauth_for_sensitive: boolean
          time_format: string
          timezone: string
          ui_compact_density: boolean
          ui_density_mode: string
          ui_reduced_motion: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_format?: string
          display_name?: string | null
          id?: string
          inactivity_timeout_minutes?: number
          notify_email_product_updates?: boolean
          notify_email_security_alerts?: boolean
          notify_email_team_changes?: boolean
          notify_email_workspace_invites?: boolean
          security_idle_timeout_enabled?: boolean
          security_reauth_for_sensitive?: boolean
          time_format?: string
          timezone?: string
          ui_compact_density?: boolean
          ui_density_mode?: string
          ui_reduced_motion?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_format?: string
          display_name?: string | null
          id?: string
          inactivity_timeout_minutes?: number
          notify_email_product_updates?: boolean
          notify_email_security_alerts?: boolean
          notify_email_team_changes?: boolean
          notify_email_workspace_invites?: boolean
          security_idle_timeout_enabled?: boolean
          security_reauth_for_sensitive?: boolean
          time_format?: string
          timezone?: string
          ui_compact_density?: boolean
          ui_density_mode?: string
          ui_reduced_motion?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          can_manage_help: boolean
          created_at: string
          email: string
          full_name: string | null
          id: string
          platform_role: Database["public"]["Enums"]["platform_role"]
          status: Database["public"]["Enums"]["membership_status"]
          ui_density_mode: Database["public"]["Enums"]["ui_density_mode"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          can_manage_help?: boolean
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          platform_role?: Database["public"]["Enums"]["platform_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          ui_density_mode?: Database["public"]["Enums"]["ui_density_mode"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          can_manage_help?: boolean
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          platform_role?: Database["public"]["Enums"]["platform_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          ui_density_mode?: Database["public"]["Enums"]["ui_density_mode"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_transcripts: {
        Row: {
          corrected_title: string | null
          corrected_writers: string[] | null
          created_at: string | null
          id: string
          parsed_title: string | null
          parsed_writers: string[] | null
          success: boolean | null
          transcript: string
          user_id: string | null
          was_corrected: boolean | null
        }
        Insert: {
          corrected_title?: string | null
          corrected_writers?: string[] | null
          created_at?: string | null
          id?: string
          parsed_title?: string | null
          parsed_writers?: string[] | null
          success?: boolean | null
          transcript: string
          user_id?: string | null
          was_corrected?: boolean | null
        }
        Update: {
          corrected_title?: string | null
          corrected_writers?: string[] | null
          created_at?: string | null
          id?: string
          parsed_title?: string | null
          parsed_writers?: string[] | null
          success?: boolean | null
          transcript?: string
          user_id?: string | null
          was_corrected?: boolean | null
        }
        Relationships: []
      }
      widget_settings: {
        Row: {
          chat_enabled: boolean | null
          created_at: string | null
          id: string
          primary_color: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string | null
          id?: string
          primary_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string | null
          id?: string
          primary_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      writers: {
        Row: {
          cae_number: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          first_name: string | null
          id: string
          ipi_number: string | null
          is_active: boolean | null
          is_controlled: boolean | null
          isni: string | null
          last_name: string | null
          legal_name: string | null
          mechanical_society: string | null
          mechanical_society_id: string | null
          metadata: Json | null
          middle_name: string | null
          name: string
          notes: string | null
          phone: string | null
          pro: string | null
          pro_member_id: string | null
          territories: string[] | null
          updated_at: string | null
        }
        Insert: {
          cae_number?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ipi_number?: string | null
          is_active?: boolean | null
          is_controlled?: boolean | null
          isni?: string | null
          last_name?: string | null
          legal_name?: string | null
          mechanical_society?: string | null
          mechanical_society_id?: string | null
          metadata?: Json | null
          middle_name?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          pro?: string | null
          pro_member_id?: string | null
          territories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          cae_number?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ipi_number?: string | null
          is_active?: boolean | null
          is_controlled?: boolean | null
          isni?: string | null
          last_name?: string | null
          legal_name?: string | null
          mechanical_society?: string | null
          mechanical_society_id?: string | null
          metadata?: Json | null
          middle_name?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          pro?: string | null
          pro_member_id?: string | null
          territories?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_help_articles_by_audience: {
        Row: {
          article_content: string | null
          article_id: string | null
          article_slug: string | null
          article_title: string | null
          audience_id: string | null
          audience_slug: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          position: number | null
          published_at: string | null
          status: Database["public"]["Enums"]["help_article_status"] | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_help_categories_by_audience: {
        Row: {
          audience_id: string | null
          audience_name: string | null
          audience_slug: string | null
          category_description: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          position: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_queue_item: { Args: { p_queue_id: string }; Returns: string }
      archive_help_article: { Args: { _article_id: string }; Returns: boolean }
      archive_old_notifications: { Args: never; Returns: number }
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
      can_manage_help: { Args: { _user_id: string }; Returns: boolean }
      can_manage_help_content: { Args: { _user_id: string }; Returns: boolean }
      check_escalations: { Args: never; Returns: number }
      check_is_company_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      client_can_view_song: {
        Args: { p_client_account_id: string; p_song_id: string }
        Returns: boolean
      }
      create_notification:
        | {
            Args: {
              _correlation_id?: string
              _message: string
              _metadata?: Json
              _notification_type: Database["public"]["Enums"]["notification_type"]
              _priority?: Database["public"]["Enums"]["notification_priority"]
              _recipient_id: string
              _record_id?: string
              _record_type?: string
              _tenant_id?: string
              _title: string
            }
            Returns: string
          }
        | {
            Args: {
              _correlation_id?: string
              _message: string
              _metadata?: Json
              _notification_type: Database["public"]["Enums"]["notification_type"]
              _priority?: Database["public"]["Enums"]["notification_priority"]
              _recipient_id: string
              _record_id?: string
              _record_type?: string
              _tenant_id?: string
              _title: string
            }
            Returns: string
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
      get_user_client_accounts: {
        Args: { check_user_id: string }
        Returns: string[]
      }
      get_user_contexts: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["portal_context"][]
      }
      get_user_organizations: {
        Args: { _user_id: string }
        Returns: {
          has_admin_module: boolean
          has_licensing_module: boolean
          org_id: string
          org_name: string
          org_slug: string
          user_org_role: Database["public"]["Enums"]["org_role"]
        }[]
      }
      has_active_membership: { Args: { _user_id: string }; Returns: boolean }
      has_module_access: {
        Args: {
          _module: Database["public"]["Enums"]["module_type"]
          _user_id: string
        }
        Returns: boolean
      }
      has_module_access_level: {
        Args: {
          _level: Database["public"]["Enums"]["access_level"]
          _module: Database["public"]["Enums"]["module_type"]
          _org_id: string
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_view: {
        Args: { article_id: string }
        Returns: undefined
      }
      is_active_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_user: { Args: { check_user_id: string }; Returns: boolean }
      is_external_auditor: { Args: { _user_id: string }; Returns: boolean }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_platform_user: { Args: { _user_id: string }; Returns: boolean }
      is_song_visible_to_client: {
        Args: { check_client_id: string; check_song_id: string }
        Returns: boolean
      }
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
      publish_help_article_version: {
        Args: { _article_id: string; _version_id: string }
        Returns: boolean
      }
      resolve_notification: {
        Args: {
          _notification_id: string
          _resolution_type: string
          _resolved_by?: string
        }
        Returns: boolean
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
      submit_song_to_queue: {
        Args: { p_submitted_data: Json }
        Returns: string
      }
      user_has_client_access: {
        Args: { p_client_account_id: string; p_user_id: string }
        Returns: boolean
      }
      validate_api_token: {
        Args: { _endpoint: string; _method: string; _token_hash: string }
        Returns: {
          is_valid: boolean
          scope: Database["public"]["Enums"]["api_token_scope"]
          tenant_id: string
          token_id: string
        }[]
      }
    }
    Enums: {
      access_level: "viewer" | "editor" | "manager" | "approver"
      access_request_status: "pending" | "processed"
      agreement_status: "draft" | "active" | "expired" | "terminated"
      api_token_scope: "platform_read" | "organization_read"
      api_token_status: "active" | "revoked" | "expired"
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
      client_account_status: "active" | "suspended" | "archived"
      client_member_role: "owner" | "team" | "viewer"
      company_user_role: "super_admin" | "admin" | "viewer"
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
      escalation_status: "pending" | "escalated" | "resolved" | "expired"
      help_article_status: "draft" | "internal" | "published" | "archived"
      help_visibility: "public" | "internal"
      interested_party_type: "writer" | "publisher" | "administrator"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
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
      module_type: "admin" | "licensing"
      notification_priority: "low" | "normal" | "high" | "critical"
      notification_resolution_type:
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled"
        | "expired"
      notification_type:
        | "authority_change_proposal"
        | "licensing_request"
        | "payment_failure"
        | "refund_initiated"
        | "approval_timeout"
        | "security_event"
        | "export_completed"
        | "membership_change"
      org_role: "org_owner" | "org_admin" | "org_staff" | "org_client"
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
      recovery_event_type:
        | "backup_created"
        | "backup_verified"
        | "restore_initiated"
        | "restore_completed"
        | "restore_failed"
        | "integrity_check"
      refund_reason:
        | "duplicate"
        | "fraudulent"
        | "requested_by_customer"
        | "service_not_provided"
        | "other"
      song_queue_status:
        | "submitted"
        | "pending"
        | "in_review"
        | "needs_revision"
        | "approved"
        | "rejected"
      ui_density_mode: "comfortable" | "compact"
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
      access_level: ["viewer", "editor", "manager", "approver"],
      access_request_status: ["pending", "processed"],
      agreement_status: ["draft", "active", "expired", "terminated"],
      api_token_scope: ["platform_read", "organization_read"],
      api_token_status: ["active", "revoked", "expired"],
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
      client_account_status: ["active", "suspended", "archived"],
      client_member_role: ["owner", "team", "viewer"],
      company_user_role: ["super_admin", "admin", "viewer"],
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
      escalation_status: ["pending", "escalated", "resolved", "expired"],
      help_article_status: ["draft", "internal", "published", "archived"],
      help_visibility: ["public", "internal"],
      interested_party_type: ["writer", "publisher", "administrator"],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
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
      module_type: ["admin", "licensing"],
      notification_priority: ["low", "normal", "high", "critical"],
      notification_resolution_type: [
        "approved",
        "rejected",
        "completed",
        "cancelled",
        "expired",
      ],
      notification_type: [
        "authority_change_proposal",
        "licensing_request",
        "payment_failure",
        "refund_initiated",
        "approval_timeout",
        "security_event",
        "export_completed",
        "membership_change",
      ],
      org_role: ["org_owner", "org_admin", "org_staff", "org_client"],
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
      recovery_event_type: [
        "backup_created",
        "backup_verified",
        "restore_initiated",
        "restore_completed",
        "restore_failed",
        "integrity_check",
      ],
      refund_reason: [
        "duplicate",
        "fraudulent",
        "requested_by_customer",
        "service_not_provided",
        "other",
      ],
      song_queue_status: [
        "submitted",
        "pending",
        "in_review",
        "needs_revision",
        "approved",
        "rejected",
      ],
      ui_density_mode: ["comfortable", "compact"],
    },
  },
} as const
