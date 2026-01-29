import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY")!;
const MAILGUN_DOMAIN = "mail.tribesassets.com";
const SUPPORT_EMAIL = "support@mail.tribesassets.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface FormSubmission {
  category: string;
  message: string;
  userEmail?: string;
  userName?: string;
  workspace?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract and validate Bearer token
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate user session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Source of truth - prevents spoofing
    const authedEmail = user.email!;
    const authedName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      authedEmail.split("@")[0];

    const body: FormSubmission = await req.json();
    const { category, message, userEmail, workspace } = body;

    // Optional: Detect spoofing attempts
    if (userEmail && userEmail !== authedEmail) {
      console.warn("Spoofing attempt detected:", { provided: userEmail, actual: authedEmail });
      return new Response(
        JSON.stringify({ error: "userEmail does not match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received support form submission:", { category, authedEmail, workspace });

    // Validate required fields
    if (!category || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: category, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate ticket ID
    const ticketId = `SR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    console.log("Generated ticket ID:", ticketId);

    // Structured subject (includes ticket ID for tracking)
    const subject = `[Tribes Support] ${category} — New Request (${ticketId})`;

    // Structured body for AI parsing
    const structuredBody = `Category: ${category}
User: ${authedEmail}
Name: ${authedName}
Workspace: ${workspace || "Not specified"}
Ticket ID: ${ticketId}
Source: In-App Form

Message:
${message}`;

    // Insert ticket into database
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        from_email: authedEmail,
        from_name: authedName,
        user_id: user.id,
        subject: subject,
        body: message,
        status: "open",
        metadata: {
          category,
          workspace,
          ticket_id: ticketId,
          source: "in_app_form",
        },
      })
      .select("id")
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      throw ticketError;
    }

    console.log("Ticket created in database:", ticket.id);

    // Add initial message to ticket_messages
    const { error: messageError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      role: "customer",
      content: message,
    });

    if (messageError) {
      console.error("Error adding ticket message:", messageError);
      // Don't fail - ticket already created
    }

    // Send email to support inbox (triggers AI agent)
    const formData = new FormData();
    formData.append("from", `${authedName} <${authedEmail}>`);
    formData.append("to", SUPPORT_EMAIL);
    formData.append("subject", subject);
    formData.append("text", structuredBody);
    formData.append("h:X-Ticket-ID", ticketId);
    formData.append("h:X-Source", "in_app_form");
    formData.append("h:X-User-ID", user.id);

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        },
        body: formData,
      }
    );

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      console.error("Mailgun error:", error);
      // Don't fail - ticket already created in database
    } else {
      console.log("Email sent successfully via Mailgun");
    }

    console.log("Support form submitted successfully:", { ticketId, category, authedEmail });

    return new Response(
      JSON.stringify({
        success: true,
        ticketId: ticketId,
        message: "Your support request has been submitted. We'll get back to you soon.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error processing form:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
