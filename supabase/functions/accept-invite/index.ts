import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptInviteRequest {
  token: string;
}

interface AcceptInviteResponse {
  success: boolean;
  organization_id?: string;
  organization_name?: string;
  modules_granted?: string[];
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify we have the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;
    const userEmail = claimsData.user.email?.toLowerCase();

    if (!userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "User email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: AcceptInviteRequest = await req.json();
    const inviteToken = body.token;

    if (!inviteToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing invite acceptance for token: ${inviteToken.substring(0, 8)}... by user: ${userEmail}`);

    // Use service role for database operations
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("invitations")
      .select(`
        *,
        tenants:organization_id (id, name, slug)
      `)
      .eq("token", inviteToken)
      .single();

    if (inviteError || !invitation) {
      console.error("Invite fetch error:", inviteError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid invitation token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate invitation status
    if (invitation.status !== "pending") {
      return new Response(
        JSON.stringify({ success: false, error: `Invitation already ${invitation.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({ success: false, error: "Invitation has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify email matches
    if (invitation.invited_email.toLowerCase() !== userEmail) {
      console.error(`Email mismatch: invited=${invitation.invited_email}, user=${userEmail}`);
      return new Response(
        JSON.stringify({ success: false, error: "This invitation was sent to a different email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const organizationId = invitation.organization_id;
    const organizationName = (invitation.tenants as any)?.name || "Unknown Organization";

    // Start processing - all in a transaction-like flow
    console.log(`Creating membership for user ${userId} in org ${organizationId}`);

    // 1. Ensure user profile exists and is active
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("id, status")
      .eq("user_id", userId)
      .single();

    if (!existingProfile) {
      // Create profile
      await supabaseAdmin
        .from("user_profiles")
        .insert({
          user_id: userId,
          email: userEmail,
          platform_role: "platform_user",
          status: "active",
        });
    } else if (existingProfile.status !== "active") {
      // Activate profile
      await supabaseAdmin
        .from("user_profiles")
        .update({ status: "active" })
        .eq("user_id", userId);
    }

    // 2. Check if membership already exists
    const { data: existingMembership } = await supabaseAdmin
      .from("tenant_memberships")
      .select("id, status")
      .eq("user_id", userId)
      .eq("tenant_id", organizationId)
      .single();

    // Determine allowed contexts based on module grants
    const allowedContexts: string[] = [];
    if (invitation.grant_admin_module) allowedContexts.push("publishing");
    if (invitation.grant_licensing_module) allowedContexts.push("licensing");

    if (existingMembership) {
      // Update existing membership
      await supabaseAdmin
        .from("tenant_memberships")
        .update({
          status: "active",
          org_role: invitation.org_role,
          allowed_contexts: allowedContexts,
          default_context: allowedContexts[0] || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMembership.id);
    } else {
      // Create new membership
      await supabaseAdmin
        .from("tenant_memberships")
        .insert({
          user_id: userId,
          tenant_id: organizationId,
          status: "active",
          role: invitation.org_role === "org_owner" || invitation.org_role === "org_admin" 
            ? "tenant_admin" 
            : "tenant_user",
          org_role: invitation.org_role,
          allowed_contexts: allowedContexts,
          default_context: allowedContexts[0] || null,
        });
    }

    // 3. Create module access records
    const modulesGranted: string[] = [];

    if (invitation.grant_admin_module) {
      // Remove existing then insert (upsert behavior)
      await supabaseAdmin
        .from("module_access")
        .delete()
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .eq("module", "admin");

      await supabaseAdmin
        .from("module_access")
        .insert({
          user_id: userId,
          organization_id: organizationId,
          module: "admin",
          access_level: invitation.admin_access_level || "viewer",
          granted_by: invitation.invited_by_user_id,
        });
      
      modulesGranted.push("admin");
    }

    if (invitation.grant_licensing_module) {
      // Remove existing then insert (upsert behavior)
      await supabaseAdmin
        .from("module_access")
        .delete()
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .eq("module", "licensing");

      await supabaseAdmin
        .from("module_access")
        .insert({
          user_id: userId,
          organization_id: organizationId,
          module: "licensing",
          access_level: invitation.licensing_access_level || "viewer",
          granted_by: invitation.invited_by_user_id,
        });
      
      modulesGranted.push("licensing");
    }

    // 4. Mark invitation as accepted
    await supabaseAdmin
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userId,
      })
      .eq("id", invitation.id);

    // 5. Log audit event
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        action: "record_created",
        action_label: `User accepted invitation to ${organizationName}`,
        actor_id: userId,
        actor_email: userEmail,
        actor_type: "user",
        record_type: "invitation",
        record_id: invitation.id,
        tenant_id: organizationId,
        details: {
          org_role: invitation.org_role,
          modules_granted: modulesGranted,
        },
      });

    console.log(`Successfully accepted invitation: ${invitation.id}`);

    const response: AcceptInviteResponse = {
      success: true,
      organization_id: organizationId,
      organization_name: organizationName,
      modules_granted: modulesGranted,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Accept invite error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
