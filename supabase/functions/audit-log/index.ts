import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditLogEntry {
  tenant_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This function is meant to be called internally or by authenticated services
    // It uses the service role to write audit logs (append-only)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authorization header to identify the calling user (if any)
    const authHeader = req.headers.get("Authorization");
    let callingUserId: string | null = null;

    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false },
        }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      callingUserId = user?.id ?? null;
    }

    const body: AuditLogEntry = await req.json();

    // Validate required fields
    if (!body.action || !body.resource_type) {
      return new Response(
        JSON.stringify({ error: "action and resource_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IP and user agent for audit trail
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("cf-connecting-ip") || 
                      null;
    const userAgent = req.headers.get("user-agent") || null;

    // Insert audit log using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        tenant_id: body.tenant_id || null,
        user_id: body.user_id || callingUserId,
        action: body.action,
        resource_type: body.resource_type,
        resource_id: body.resource_id || null,
        details: body.details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Audit log insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to write audit log" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Audit log created: ${body.action} on ${body.resource_type}`, data.id);

    return new Response(
      JSON.stringify({ success: true, id: data.id, created_at: data.created_at }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Audit log error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
