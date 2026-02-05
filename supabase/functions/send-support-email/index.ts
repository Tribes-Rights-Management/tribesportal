 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
 const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY")!;
 const MAILGUN_DOMAIN = "mail.tribesassets.com";
 
 const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
 interface EmailRequest {
   to: string[];
   subject: string;
   body: string;
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
 
     const body: EmailRequest = await req.json();
     const { to, subject, body: emailBody } = body;
 
     console.log("Received email request:", { to, subject, userEmail: user.email });
 
     // Validate required fields
     if (!to || !Array.isArray(to) || to.length === 0 || !subject || !emailBody) {
       console.error("Missing required fields");
       return new Response(
         JSON.stringify({ error: "Missing required fields: to, subject, body" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Send emails to all recipients
     const results = await Promise.allSettled(
       to.map(async (recipient) => {
         const formData = new FormData();
         formData.append("from", `Tribes Rights Management <publishing@${MAILGUN_DOMAIN}>`);
         formData.append("to", recipient);
         formData.append("subject", subject);
         formData.append("text", emailBody);
 
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
           console.error(`Mailgun error for ${recipient}:`, error);
           throw new Error(`Failed to send to ${recipient}`);
         }
 
         console.log(`Email sent successfully to ${recipient}`);
         return { recipient, success: true };
       })
     );
 
     const sent = results.filter((r) => r.status === "fulfilled").length;
     const failed = results.filter((r) => r.status === "rejected").length;
 
     console.log(`Email send complete: ${sent} sent, ${failed} failed`);
 
     return new Response(
       JSON.stringify({
         success: true,
         sent,
         failed,
         message: `Sent ${sent} email(s)${failed > 0 ? `, ${failed} failed` : ""}`,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error: unknown) {
     const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
     console.error("Error processing email request:", error);
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });