import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (per IP, per function instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  message: string;
  source?: string;
}

// Validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

function validateSubmission(body: unknown): { valid: boolean; error?: string; data?: ContactSubmission } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { name, email, company, message, source } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (typeof email !== "string" || !isValidEmail(email)) {
    return { valid: false, error: "Valid email is required" };
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }

  if (message.trim().length > 5000) {
    return { valid: false, error: "Message too long (max 5000 characters)" };
  }

  return {
    valid: true,
    data: {
      name: sanitizeString(name, 100),
      email: sanitizeString(email, 255),
      company: company ? sanitizeString(String(company), 200) : undefined,
      message: sanitizeString(message, 5000),
      source: source ? sanitizeString(String(source), 50) : "website",
    },
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get IP for rate limiting
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.headers.get("cf-connecting-ip") ||
                      "unknown";
    const userAgent = req.headers.get("user-agent") || null;

    // Check rate limit
    if (!checkRateLimit(ipAddress)) {
      console.log(`Rate limit exceeded for IP: ${ipAddress}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateSubmission(body);
    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to insert (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Insert the submission
    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert({
        name: validation.data.name,
        email: validation.data.email,
        company: validation.data.company,
        message: validation.data.message,
        source: validation.data.source,
        ip_address: ipAddress !== "unknown" ? ipAddress : null,
        user_agent: userAgent,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Contact submission insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the submission to audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "contact_submission_created",
      resource_type: "contact_submission",
      resource_id: data.id,
      details: {
        email: validation.data.email,
        source: validation.data.source,
      },
      ip_address: ipAddress !== "unknown" ? ipAddress : null,
      user_agent: userAgent,
    });

    console.log(`Contact submission created: ${data.id} from ${validation.data.email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you for your message. We will be in touch soon." 
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact submit error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
