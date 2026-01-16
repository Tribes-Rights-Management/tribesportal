import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

interface ExportData {
  watermark: string
  generated_at: string
  export_type: string
  parameters: Record<string, unknown>
  [key: string]: unknown
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
      .select('platform_role, status, email')
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

    // Generate watermark
    const watermark = `TRIBES-${export_type.toUpperCase()}-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    
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

    try {
      switch (export_type) {
        case 'licensing_activity': {
          // Fetch licensing requests and agreements within date range
          let query = supabaseAdmin.from('licensing_requests').select(`
            id, work_title, usage_type, territory, term_description,
            status, requester_email, created_at, updated_at, tenant_id
          `)
          
          if (parameters.start_date) {
            query = query.gte('created_at', parameters.start_date)
          }
          if (parameters.end_date) {
            query = query.lte('created_at', parameters.end_date)
          }
          if (parameters.tenant_id) {
            query = query.eq('tenant_id', parameters.tenant_id)
          }
          
          const { data: requests, error: reqError } = await query.order('created_at', { ascending: false })
          if (reqError) throw reqError

          // Also get agreements
          let agreementQuery = supabaseAdmin.from('licensing_agreements').select(`
            id, agreement_title, status, effective_date, end_date,
            created_at, updated_at, tenant_id, request_id
          `)
          
          if (parameters.start_date) {
            agreementQuery = agreementQuery.gte('created_at', parameters.start_date)
          }
          if (parameters.end_date) {
            agreementQuery = agreementQuery.lte('created_at', parameters.end_date)
          }
          if (parameters.tenant_id) {
            agreementQuery = agreementQuery.eq('tenant_id', parameters.tenant_id)
          }

          const { data: agreements, error: agrError } = await agreementQuery.order('created_at', { ascending: false })
          if (agrError) throw agrError

          exportData = {
            watermark,
            generated_at: new Date().toISOString(),
            export_type: 'Licensing Activity Pack',
            parameters: {
              date_range: {
                start: parameters.start_date || 'All time',
                end: parameters.end_date || 'Present'
              },
              tenant_id: parameters.tenant_id || 'All tenants'
            },
            licensing_requests: requests || [],
            licensing_agreements: agreements || []
          }
          recordCount = (requests?.length || 0) + (agreements?.length || 0)
          break
        }

        case 'approval_history': {
          // Fetch audit logs for approval actions
          let query = supabaseAdmin.from('audit_logs').select(`
            id, action, action_label, actor_email, actor_type,
            record_type, record_id, tenant_id, created_at, details
          `).in('action', ['record_approved', 'record_rejected', 'access_granted', 'access_revoked'])

          if (parameters.start_date) {
            query = query.gte('created_at', parameters.start_date)
          }
          if (parameters.end_date) {
            query = query.lte('created_at', parameters.end_date)
          }
          if (parameters.actor_id) {
            query = query.eq('actor_id', parameters.actor_id)
          }

          const { data: approvals, error: appError } = await query.order('created_at', { ascending: false })
          if (appError) throw appError

          exportData = {
            watermark,
            generated_at: new Date().toISOString(),
            export_type: 'Approval History Pack',
            parameters: {
              date_range: {
                start: parameters.start_date || 'All time',
                end: parameters.end_date || 'Present'
              },
              actor_filter: parameters.actor_id || 'All actors'
            },
            approval_events: approvals || []
          }
          recordCount = approvals?.length || 0
          break
        }

        case 'agreement_registry': {
          // Fetch all agreements with current status
          let query = supabaseAdmin.from('licensing_agreements').select(`
            id, agreement_title, status, effective_date, end_date,
            created_at, updated_at, tenant_id, request_id
          `)

          if (parameters.tenant_id) {
            query = query.eq('tenant_id', parameters.tenant_id)
          }

          const { data: agreements, error: agrError } = await query.order('created_at', { ascending: false })
          if (agrError) throw agrError

          // Also get portal agreements
          let portalQuery = supabaseAdmin.from('portal_agreements').select(`
            id, agreement_title, status, created_at, tenant_id
          `)

          if (parameters.tenant_id) {
            portalQuery = portalQuery.eq('tenant_id', parameters.tenant_id)
          }

          const { data: portalAgreements, error: paError } = await portalQuery.order('created_at', { ascending: false })
          if (paError) throw paError

          exportData = {
            watermark,
            generated_at: new Date().toISOString(),
            export_type: 'Agreement Registry Pack',
            parameters: {
              tenant_filter: parameters.tenant_id || 'All tenants'
            },
            licensing_agreements: agreements || [],
            portal_agreements: portalAgreements || []
          }
          recordCount = (agreements?.length || 0) + (portalAgreements?.length || 0)
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

      // Log the export generation to audit log
      await supabaseAdmin.from('audit_logs').insert({
        action: 'export_generated',
        action_label: `Generated ${export_type.replace(/_/g, ' ')} disclosure export`,
        actor_id: user.id,
        actor_email: profile.email || user.email,
        actor_type: 'user',
        record_type: 'disclosure_export',
        record_id: exportRecord.id,
        details: { export_type, watermark, record_count: recordCount, parameters }
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
