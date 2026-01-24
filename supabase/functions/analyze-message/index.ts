import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  message: string;
  senderName: string;
  subject: string | null;
  companyName?: string;
  responseStyle?: 'formal' | 'friendly' | 'professional';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, senderName, subject, companyName = 'Tribes Rights Management', responseStyle = 'professional' }: AnalysisRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are analyzing a customer support message for ${companyName}, a music publishing rights management platform.

Analyze the message and provide a JSON response with:

1. **priority** (string): One of: "urgent", "high", "medium", "low"
   - urgent: System down, data loss, security issue, angry escalation
   - high: Important feature not working, blocking work, payment issues
   - medium: Questions about features, how-to requests, minor bugs
   - low: General questions, feature requests, feedback

2. **suggestedCategory** (string): Best category for this message
   - Options: "Technical Support", "Billing", "Account", "Feature Request", "Bug Report", "General Question", "Feedback"

3. **sentiment** (string): One of: "positive", "neutral", "negative", "frustrated"

4. **topics** (array of strings): Key topics/themes in the message (max 3)

5. **draftResponse** (string): A ${responseStyle} response draft that:
   - Acknowledges their message
   - Addresses their concern
   - Provides helpful information or next steps
   - Maintains ${companyName}'s institutional, professional tone
   - Is ready for a human to review and send

6. **reasoning** (string): Brief explanation of your priority/category decision

7. **confidence** (number): 0-100, how confident you are in this analysis

Return ONLY valid JSON, no markdown, no explanation.`;

    const userPrompt = `MESSAGE DETAILS:
From: ${senderName}
Subject: ${subject || 'No subject'}
Message:
${message}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON response from AI
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback analysis
      analysis = {
        priority: 'medium',
        suggestedCategory: 'General Question',
        sentiment: 'neutral',
        topics: ['Support Request'],
        draftResponse: `Hi ${senderName},\n\nThank you for reaching out to ${companyName}. We've received your message and a team member will review it shortly.\n\nBest regards,\n${companyName} Support Team`,
        reasoning: 'AI analysis could not parse response - using default values',
        confidence: 0,
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-message error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
