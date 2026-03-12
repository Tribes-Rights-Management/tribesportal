import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface MailgunWebhookPayload {
  sender: string;
  from: string;
  "Reply-To"?: string;
  subject: string;
  "body-plain": string;
  "body-html"?: string;
  "Message-Id": string;
  recipient: string;
  timestamp: string;
  "stripped-text"?: string;
}

interface AgentConfig {
  company_name: string;
  support_email: string;
  agent_name: string;
  escalation_email: string;
  business_description: string;
  tone: string;
  auto_reply_enabled: string;
  confidence_threshold: string;
}

async function getAgentConfig(): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from("ai_agent_config")
    .select("config_key, config_value");

  if (error) throw error;

  const config: Record<string, string> = {};
  data.forEach((row: { config_key: string; config_value: string }) => {
    config[row.config_key] = row.config_value;
  });

  return config as unknown as AgentConfig;
}

async function findRelevantKnowledge(query: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("support_knowledge_base")
    .select("title, content")
    .eq("is_active", true);

  if (error || !data) return [];

  const queryWords = query.toLowerCase().split(/\s+/);
  const scored = data.map((doc: { title: string; content: string }) => {
    const text = `${doc.title} ${doc.content}`.toLowerCase();
    const score = queryWords.filter((word: string) => text.includes(word)).length;
    return { ...doc, score };
  });

  return scored
    .filter((doc: { score: number }) => doc.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 3)
    .map((doc: { title: string; content: string }) => `**${doc.title}**\n${doc.content}`);
}

async function checkExistingTicket(email: string): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("from_email", email)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

async function createTicket(payload: MailgunWebhookPayload, customerEmail: string): Promise<string> {
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      from_email: customerEmail,
      from_name: extractName(payload.from),
      subject: payload.subject,
      body: payload["stripped-text"] || payload["body-plain"],
      mailgun_message_id: payload["Message-Id"],
      metadata: {
        recipient: payload.recipient,
        timestamp: payload.timestamp,
      },
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function addMessage(ticketId: string, role: string, content: string, messageId?: string) {
  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    role,
    content,
    mailgun_message_id: messageId,
  });

  if (error) throw error;
}

async function getConversationHistory(ticketId: string): Promise<Array<{ role: string; content: string }>> {
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("role, content")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

function extractName(from: string): string {
  const match = from.match(/^([^<]+)</);
  return match ? match[1].trim() : from.split("@")[0];
}

function extractFirstName(from: string): string {
  const name = extractName(from);
  return name.split(/\s+/)[0];
}

async function generateAIResponse(
  config: AgentConfig,
  customerMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  relevantKnowledge: string[]
): Promise<{ response: string; shouldEscalate: boolean }> {
  const knowledgeContext = relevantKnowledge.length > 0
    ? `\n\nRelevant knowledge base articles:\n${relevantKnowledge.join("\n\n")}`
    : "";

  const historyContext = conversationHistory.length > 0
    ? `\n\nPrevious conversation:\n${conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n")}`
    : "";

  const systemPrompt = `You are the AI support agent for ${config.company_name}. ${config.business_description}

Your tone: ${config.tone}

Guidelines:
- Be helpful, professional, and concise
- If you can answer from the knowledge base, do so confidently
- If you are unsure or the question requires human judgment (contract specifics, legal matters, complex account issues), indicate that you will escalate to a human team member
- Never make up information about royalty amounts, specific contract terms, or account details
- Always be warm and make the customer feel valued
- Sign off with "Best," followed by a new line and then "${config.agent_name}". Never use "Best regards" or other formal closings.
If you need to escalate, include the exact phrase "ESCALATE_TO_HUMAN" at the very end of your response (this will be removed before sending).
${knowledgeContext}
${historyContext}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: customerMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const aiResponse = data.content[0].text;

  const shouldEscalate = aiResponse.includes("ESCALATE_TO_HUMAN");
  const cleanResponse = aiResponse.replace("ESCALATE_TO_HUMAN", "").trim();

  return { response: cleanResponse, shouldEscalate };
}

async function sendSupportEmail(
  to: string,
  subject: string,
  body: string,
  replyTo?: string,
  originalMessage?: string,
  originalFrom?: string,
  originalTimestamp?: string
): Promise<void> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-support-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        replyTo,
        originalMessage,
        originalFrom,
        originalTimestamp,
        isAIResponse: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`send-support-email error: ${error}`);
  }
}

async function sendEscalationNotification(
  config: AgentConfig,
  ticketId: string,
  customerEmail: string,
  subject: string,
  originalMessage: string,
  aiResponse: string
) {
  const escalationBody = `
ESCALATION ALERT - Support Ticket

Ticket ID: ${ticketId}
Customer: ${customerEmail}
Subject: ${subject}

Original Message:
${originalMessage}

AI Response Sent:
${aiResponse}

---
This ticket has been flagged for human follow-up. Please review and respond as needed.
`;

  await sendSupportEmail(
    config.escalation_email,
    `[ESCALATION] ${subject}`,
    escalationBody
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const payload: MailgunWebhookPayload = {
      sender: formData.get("sender") as string,
      from: formData.get("from") as string,
      "Reply-To": formData.get("Reply-To") as string || undefined,
      subject: formData.get("subject") as string,
      "body-plain": formData.get("body-plain") as string,
      "body-html": formData.get("body-html") as string || undefined,
      "Message-Id": formData.get("Message-Id") as string,
      recipient: formData.get("recipient") as string,
      timestamp: formData.get("timestamp") as string,
      "stripped-text": formData.get("stripped-text") as string || undefined,
    };

    console.log("Received webhook:", { sender: payload.sender, from: payload.from, replyTo: payload["Reply-To"], subject: payload.subject });

    // Ignore emails from our own support address (prevents loops)
    const senderEmail = (payload.sender || payload.from || "").toLowerCase();
    if (senderEmail === "support@mail.tribesassets.com") {
      console.log("Ignoring email from support address (loop prevention):", senderEmail);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "self-email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Reply-To as the real customer email (submit-contact sets this to the submitter's address)
    const customerEmail = payload["Reply-To"] || payload.sender || payload.from;
    console.log("Customer email resolved to:", customerEmail);

    const config = await getAgentConfig();

    if (config.auto_reply_enabled !== "true") {
      console.log("Auto-reply disabled, storing ticket only");
      const ticketId = await createTicket(payload, customerEmail);
      await addMessage(ticketId, "customer", payload["stripped-text"] || payload["body-plain"], payload["Message-Id"]);
      return new Response(JSON.stringify({ success: true, ticketId, autoReply: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingTicket = await checkExistingTicket(customerEmail);
    let ticketId: string;
    let conversationHistory: Array<{ role: string; content: string }> = [];

    if (existingTicket) {
      ticketId = existingTicket.id;
      conversationHistory = await getConversationHistory(ticketId);
    } else {
      ticketId = await createTicket(payload, customerEmail);
    }

    const customerMessage = payload["stripped-text"] || payload["body-plain"];
    await addMessage(ticketId, "customer", customerMessage, payload["Message-Id"]);

    const relevantKnowledge = await findRelevantKnowledge(customerMessage);

    const { response: aiResponse, shouldEscalate } = await generateAIResponse(
      config,
      customerMessage,
      conversationHistory,
      relevantKnowledge
    );

    await addMessage(ticketId, "ai", aiResponse);

    if (shouldEscalate) {
      await supabase
        .from("support_tickets")
        .update({ status: "escalated" })
        .eq("id", ticketId);
    }

    const emailSubject = payload.subject.startsWith("Re:")
      ? payload.subject
      : `Re: ${payload.subject}`;

    await sendSupportEmail(
      customerEmail,
      emailSubject,
      aiResponse,
      config.support_email,
      payload["stripped-text"] || payload["body-plain"],
      payload.from,
      payload.timestamp
    );

    if (shouldEscalate) {
      await sendEscalationNotification(
        config,
        ticketId,
        customerEmail,
        payload.subject,
        customerMessage,
        aiResponse
      );
    }

    console.log("Successfully processed ticket:", ticketId);

    return new Response(
      JSON.stringify({
        success: true,
        ticketId,
        escalated: shouldEscalate,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
