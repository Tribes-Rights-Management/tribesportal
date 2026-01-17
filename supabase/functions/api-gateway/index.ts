/**
 * READ-ONLY API GATEWAY
 * 
 * Scoped, auditable API access for external systems.
 * All endpoints are read-only and respect authority boundaries.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-token",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

interface TokenValidation {
  is_valid: boolean;
  token_id: string | null;
  scope: "platform_read" | "organization_read" | null;
  tenant_id: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests (read-only)
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. API is read-only." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const endpoint = url.pathname.replace("/api-gateway", "");

  // Initialize Supabase client with service role for validation
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Extract API token from header
    const apiToken = req.headers.get("x-api-token");
    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: "Missing API token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token format
    if (!apiToken.startsWith("tribes_")) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the token for lookup
    const rawToken = apiToken.replace("tribes_", "");
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawToken));
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Validate token via RPC
    const { data: validation, error: validationError } = await supabase
      .rpc("validate_api_token", {
        _token_hash: tokenHash,
        _endpoint: endpoint,
        _method: req.method,
      });

    if (validationError || !validation || !validation[0]?.is_valid) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = validation[0] as TokenValidation;

    // Route to appropriate handler based on endpoint
    let responseData: unknown;
    let responseStatus = 200;

    switch (true) {
      case endpoint === "/health":
        responseData = { status: "healthy", timestamp: new Date().toISOString() };
        break;

      case endpoint === "/organizations":
        if (tokenData.scope !== "platform_read") {
          return new Response(
            JSON.stringify({ error: "Insufficient scope for this endpoint" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: orgs } = await supabase
          .from("tenants")
          .select("id, name, slug, created_at")
          .order("name");
        responseData = { organizations: orgs };
        break;

      case endpoint === "/contracts":
        const contractQuery = supabase
          .from("contracts")
          .select("id, contract_number, title, status, effective_date, expiration_date, tenant_id, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        
        if (tokenData.scope === "organization_read" && tokenData.tenant_id) {
          contractQuery.eq("tenant_id", tokenData.tenant_id);
        }
        
        const { data: contracts } = await contractQuery;
        responseData = { contracts };
        break;

      case endpoint === "/invoices":
        const invoiceQuery = supabase
          .from("invoices")
          .select("id, invoice_number, status, total_amount, currency, issue_date, due_date, tenant_id, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        
        if (tokenData.scope === "organization_read" && tokenData.tenant_id) {
          invoiceQuery.eq("tenant_id", tokenData.tenant_id);
        }
        
        const { data: invoices } = await invoiceQuery;
        responseData = { invoices };
        break;

      case endpoint === "/payments":
        const paymentQuery = supabase
          .from("payments")
          .select("id, amount, currency, status, processed_at, tenant_id, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        
        if (tokenData.scope === "organization_read" && tokenData.tenant_id) {
          paymentQuery.eq("tenant_id", tokenData.tenant_id);
        }
        
        const { data: payments } = await paymentQuery;
        responseData = { payments };
        break;

      case endpoint === "/audit-summary":
        if (tokenData.scope !== "platform_read") {
          return new Response(
            JSON.stringify({ error: "Insufficient scope for this endpoint" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get audit summary counts
        const { count: totalAuditLogs } = await supabase
          .from("audit_logs")
          .select("*", { count: "exact", head: true });
        
        const { count: recentAuditLogs } = await supabase
          .from("audit_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        responseData = {
          audit_summary: {
            total_events: totalAuditLogs,
            events_last_24h: recentAuditLogs,
            generated_at: new Date().toISOString(),
          },
        };
        break;

      default:
        responseStatus = 404;
        responseData = { error: "Endpoint not found" };
    }

    const responseTime = Date.now() - startTime;

    // Log API access
    await supabase.from("api_access_logs").insert({
      token_id: tokenData.token_id,
      endpoint,
      method: req.method,
      scope_type: tokenData.scope,
      tenant_id: tokenData.tenant_id,
      response_status: responseStatus,
      response_time_ms: responseTime,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
    });

    return new Response(
      JSON.stringify(responseData),
      { 
        status: responseStatus, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-Response-Time": `${responseTime}ms`,
        } 
      }
    );

  } catch (error) {
    console.error("API Gateway error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
