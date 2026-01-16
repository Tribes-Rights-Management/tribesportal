import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * REGULATORY DISCLOSURE EXPORT GENERATOR
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * GOVERNANCE RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. AUTHORIZATION: Platform administrators only
 * 2. IMMUTABILITY: Exports from immutable audit logs only
 * 3. REPRODUCIBILITY: Same parameters produce consistent results
 * 4. AUDIT TRAIL: Every generation logged with actor, timestamp, scope
 * 5. CORRELATION: All records include correlation IDs
 * 6. ACTOR ATTRIBUTION: Actor identity and role at time of action
 * 7. EVENT ORDERING: Timestamps and chronological ordering preserved
 * 
 * EXPORT CONTENTS:
 * - Scope definition (date range, workspace(s), event types)
 * - Correlation IDs for all included records
 * - Actor identity and role at time of action
 * - Timestamps and event ordering (ascending chronological)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  export_type: 'licensing_activity' | 'approval_history' | 'agreement_registry'
  parameters: {
    start_date?: string
    end_date?: string
    actor_id?: string
    tenant_id?: string
  }
}

interface ExportMetadata {
  watermark: string
  generated_at: string
  generated_by: {
    user_id: string
    email: string
    role: string
    role_at_time: string
  }
  export_type: string
  export_type_label: string
  scope: {
    date_range: {
      start: string
      end: string
    }
    tenant_filter: string
    event_types: string[]
  }
  reproducibility_note: string
}

interface ExportRecord {
  id: string
  correlation_id: string | null
  timestamp: string
  actor: {
    id: string | null
    email: string | null
    type: string
    role_at_time?: string
  }
  [key: string]: unknown
}

interface ExportData {
  metadata: ExportMetadata
  records: ExportRecord[]
  record_count: number
  integrity_hash?: string
}

const EXPORT_TYPE_LABELS: Record<string, string> = {
  licensing_activity: 'Licensing Activity Pack',
  approval_history: 'Approval History Pack',
  agreement_registry: 'Agreement Registry Pack',
}

const EXPORT_TYPE_EVENT_TYPES: Record<string, string[]> = {
  licensing_activity: ['licensing_request', 'licensing_agreement', 'record_created', 'record_updated'],
  approval_history: ['record_approved', 'record_rejected', 'access_granted', 'access_revoked'],
  agreement_registry: ['licensing_agreement', 'portal_agreement'],
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get auth header for user context
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's auth
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is platform admin
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check platform admin role
    const { data: profile, error: profileError } = await supabaseUser
      .from('user_profiles')
      .select('platform_role, status, email, full_name')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.platform_role !== 'platform_admin' || profile.status !== 'active') {
      console.error('Access denied - not platform admin')
      return new Response(
        JSON.stringify({ error: 'Access denied. Platform administrator role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { export_type, parameters }: ExportRequest = await req.json()
    console.log(`Generating ${export_type} export with parameters:`, parameters)

    // Create service client for data access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Generate watermark with timestamp for reproducibility reference
    const timestamp = new Date().toISOString()
    const watermark = `TRIBES-${export_type.toUpperCase()}-${timestamp.replace(/[-:T.]/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    
    // Create export record
    const { data: exportRecord, error: insertError } = await supabaseAdmin
      .from('disclosure_exports')
      .insert({
        export_type,
        generated_by: user.id,
        watermark,
        parameters,
        status: 'generating'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create export record:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create export record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate export data based on type
    let exportData: ExportData
    let recordCount = 0

    // Common metadata for all exports
    const metadata: ExportMetadata = {
      watermark,
      generated_at: timestamp,
      generated_by: {
        user_id: user.id,
        email: profile.email || user.email || 'unknown',
        role: profile.platform_role,
        role_at_time: 'platform_admin' // Role verified at generation time
      },
      export_type,
      export_type_label: EXPORT_TYPE_LABELS[export_type],
      scope: {
        date_range: {
          start: parameters.start_date || 'All time',
          end: parameters.end_date || 'Present'
        },
        tenant_filter: parameters.tenant_id || 'All workspaces',
        event_types: EXPORT_TYPE_EVENT_TYPES[export_type]
      },
      reproducibility_note: 'This export was generated from immutable audit logs. Running the same parameters on the same date range will produce identical results.'
    }

    try {
      switch (export_type) {
        case 'licensing_activity': {
          // Fetch from audit_logs for licensing-related events
          let query = supabaseAdmin.from('audit_logs').select(`
            id, action, action_label, actor_id, actor_email, actor_type,
            record_type, record_id, tenant_id, created_at, details, correlation_id
          `).or('record_type.eq.licensing_request,record_type.eq.licensing_agreement')
          
          if (parameters.start_date) {
            query = query.gte('created_at', parameters.start_date)
          }
          if (parameters.end_date) {
            query = query.lte('created_at', parameters.end_date + 'T23:59:59.999Z')
          }
          if (parameters.tenant_id) {
            query = query.eq('tenant_id', parameters.tenant_id)
          }
          
          // Order chronologically for event ordering
          const { data: auditRecords, error: auditError } = await query.order('created_at', { ascending: true })
          if (auditError) throw auditError

          // Transform to standard export format with correlation IDs and actor attribution
          const records: ExportRecord[] = (auditRecords || []).map(record => ({
            id: record.id,
            correlation_id: record.correlation_id,
            timestamp: record.created_at,
            actor: {
              id: record.actor_id,
              email: record.actor_email,
              type: record.actor_type,
              role_at_time: record.details?.actor_role || 'unknown'
            },
            action: record.action,
            action_label: record.action_label,
            record_type: record.record_type,
            record_id: record.record_id,
            tenant_id: record.tenant_id,
            details: record.details
          }))

          recordCount = records.length
          exportData = {
            metadata,
            records,
            record_count: recordCount
          }
          break
        }

        case 'approval_history': {
          // Fetch audit logs for approval actions only
          let query = supabaseAdmin.from('audit_logs').select(`
            id, action, action_label, actor_id, actor_email, actor_type,
            record_type, record_id, tenant_id, created_at, details, correlation_id
          `).in('action', ['record_approved', 'record_rejected', 'access_granted', 'access_revoked'])

          if (parameters.start_date) {
            query = query.gte('created_at', parameters.start_date)
          }
          if (parameters.end_date) {
            query = query.lte('created_at', parameters.end_date + 'T23:59:59.999Z')
          }
          if (parameters.actor_id) {
            query = query.eq('actor_id', parameters.actor_id)
          }

          // Order chronologically
          const { data: approvals, error: appError } = await query.order('created_at', { ascending: true })
          if (appError) throw appError

          // Transform with full actor attribution
          const records: ExportRecord[] = (approvals || []).map(record => ({
            id: record.id,
            correlation_id: record.correlation_id,
            timestamp: record.created_at,
            actor: {
              id: record.actor_id,
              email: record.actor_email,
              type: record.actor_type,
              role_at_time: record.details?.actor_role || 'unknown'
            },
            action: record.action,
            action_label: record.action_label,
            record_type: record.record_type,
            record_id: record.record_id,
            tenant_id: record.tenant_id,
            approval_details: {
              decision: record.action === 'record_approved' || record.action === 'access_granted' ? 'approved' : 'rejected',
              reason: record.details?.reason,
              previous_status: record.details?.previous_status,
              new_status: record.details?.new_status
            }
          }))

          recordCount = records.length
          exportData = {
            metadata,
            records,
            record_count: recordCount
          }
          break
        }

        case 'agreement_registry': {
          // Fetch all agreement-related audit logs
          let query = supabaseAdmin.from('audit_logs').select(`
            id, action, action_label, actor_id, actor_email, actor_type,
            record_type, record_id, tenant_id, created_at, details, correlation_id
          `).or('record_type.eq.licensing_agreement,record_type.eq.portal_agreement')

          if (parameters.tenant_id) {
            query = query.eq('tenant_id', parameters.tenant_id)
          }

          // Order chronologically
          const { data: agreementLogs, error: agrError } = await query.order('created_at', { ascending: true })
          if (agrError) throw agrError

          // Also get current agreement states for reference
          const { data: licensingAgreements } = await supabaseAdmin
            .from('licensing_agreements')
            .select('id, agreement_title, status, effective_date, end_date, created_at, tenant_id, correlation_id')
            .order('created_at', { ascending: true })

          const { data: portalAgreements } = await supabaseAdmin
            .from('portal_agreements')
            .select('id, agreement_title, status, created_at, tenant_id')
            .order('created_at', { ascending: true })

          // Transform audit logs
          const auditRecords: ExportRecord[] = (agreementLogs || []).map(record => ({
            id: record.id,
            correlation_id: record.correlation_id,
            timestamp: record.created_at,
            actor: {
              id: record.actor_id,
              email: record.actor_email,
              type: record.actor_type,
              role_at_time: record.details?.actor_role || 'unknown'
            },
            action: record.action,
            action_label: record.action_label,
            record_type: record.record_type,
            record_id: record.record_id,
            tenant_id: record.tenant_id,
            details: record.details
          }))

          recordCount = auditRecords.length
          exportData = {
            metadata: {
              ...metadata,
              scope: {
                ...metadata.scope,
                event_types: ['licensing_agreement', 'portal_agreement', 'record_created', 'record_updated', 'record_approved']
              }
            },
            records: auditRecords,
            record_count: recordCount,
            // Include current state snapshot for reference (separate from immutable logs)
            current_state_snapshot: {
              licensing_agreements: licensingAgreements || [],
              portal_agreements: portalAgreements || [],
              snapshot_timestamp: timestamp,
              note: 'This snapshot shows current agreement states at export time. The records array above shows the immutable audit trail.'
            }
          } as ExportData & { current_state_snapshot: unknown }
          break
        }

        default:
          throw new Error(`Unknown export type: ${export_type}`)
      }

      // Generate file name
      const fileName = `${watermark}.json`

      // Update export record with completion
      const { error: updateError } = await supabaseAdmin
        .from('disclosure_exports')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          record_count: recordCount,
          file_name: fileName
        })
        .eq('id', exportRecord.id)

      if (updateError) {
        console.error('Failed to update export record:', updateError)
      }

      // Log the export generation to audit log (immutable record)
      await supabaseAdmin.from('audit_logs').insert({
        action: 'export_generated',
        action_label: `Generated ${EXPORT_TYPE_LABELS[export_type]} disclosure export`,
        actor_id: user.id,
        actor_email: profile.email || user.email,
        actor_type: 'user',
        record_type: 'disclosure_export',
        record_id: exportRecord.id,
        details: { 
          export_type, 
          watermark, 
          record_count: recordCount, 
          parameters,
          actor_role: profile.platform_role,
          scope: metadata.scope
        }
      })

      console.log(`Export ${exportRecord.id} completed with ${recordCount} records`)

      return new Response(
        JSON.stringify({
          success: true,
          export_id: exportRecord.id,
          watermark,
          record_count: recordCount,
          data: exportData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (dataError: unknown) {
      const errorMessage = dataError instanceof Error ? dataError.message : 'Unknown error'
      console.error('Error generating export data:', dataError)
      
      // Update record with failure
      await supabaseAdmin
        .from('disclosure_exports')
        .update({
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', exportRecord.id)

      return new Response(
        JSON.stringify({ error: 'Failed to generate export data', details: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
