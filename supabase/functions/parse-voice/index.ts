import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParseRequest {
  transcript: string;
}

interface ParseResult {
  title: string;
  writers: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transcript }: ParseRequest = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid transcript" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // Fall back to local parsing
      return new Response(
        JSON.stringify(parseLocal(transcript)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsing voice transcript:", transcript.substring(0, 100));

    const systemPrompt = `You are a voice transcript parser for a music publishing rights management system.

Extract the song title and writer names from the user's natural speech.

Rules:
1. Extract the song title (clean it up, use proper capitalization)
2. Extract all writer names mentioned
3. If someone says "me", "myself", or "I", return "(Your name)" as a placeholder
4. Handle common patterns like:
   - "It's called [title] by [writers]"
   - "[title] written by [writers]"
   - "The song [title] and it was written by [writers]"
5. Split writer names on "and", "&", commas
6. Return proper capitalization for names (Title Case)

Return ONLY valid JSON in this exact format:
{"title": "Song Title Here", "writers": ["Writer One", "Writer Two"]}

If you cannot extract a title, return an empty string.
If you cannot extract writers, return an empty array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this voice transcript: "${transcript}"` },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Fall back to local parsing on API error
      return new Response(
        JSON.stringify(parseLocal(transcript)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI response:", content);

    // Parse JSON from AI response
    let result: ParseResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleanContent);
      
      // Validate structure
      if (typeof result.title !== "string") result.title = "";
      if (!Array.isArray(result.writers)) result.writers = [];
      result.writers = result.writers.filter((w: any) => typeof w === "string" && w.trim());
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", content, parseError);
      result = parseLocal(transcript);
    }

    console.log("Final parsed result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("parse-voice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback local parsing (regex-based)
function parseLocal(transcript: string): ParseResult {
  let title = "";
  const writers: string[] = [];

  // Try to extract title
  const calledMatch = transcript.match(/(?:called|titled)\s+["']?(.+?)["']?\s+(?:written\s+by|by\s+)/i);
  if (calledMatch) {
    title = calledMatch[1].trim();
  }

  if (!title) {
    const calledEndMatch = transcript.match(/(?:called|titled)\s+["']?([^"']+?)["']?\s*$/i);
    if (calledEndMatch) {
      title = calledEndMatch[1].trim();
    }
  }

  if (!title) {
    const quotedMatch = transcript.match(/["']([^"']{2,60})["']/);
    if (quotedMatch) {
      title = quotedMatch[1].trim();
    }
  }

  // Clean title
  if (title) {
    title = title.replace(/\s+(?:written|by)$/i, "").trim();
    title = toTitleCase(title);
  }

  // Try to extract writers
  const writerMatch = transcript.match(/(?:written\s+by|by)\s+(.+?)(?:\s*[.!?]|$)/i);
  if (writerMatch) {
    let writerStr = writerMatch[1]
      .trim()
      .replace(/\s+(?:in|from|back|last|this|split|and\s+it|we\s+wrote|,\s*\d).*$/i, "")
      .trim();

    const rawNames = writerStr
      .split(/(?:\s+and\s+|\s*&\s*|\s*,\s*(?:and\s+)?)/i)
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && n.length < 50);

    const seen = new Set<string>();

    for (const name of rawNames) {
      const lower = name.toLowerCase();

      if (/^(me|myself|i)$/i.test(name)) {
        if (!seen.has("_self_")) {
          writers.push("(Your name)");
          seen.add("_self_");
        }
        continue;
      }

      if (seen.has(lower)) continue;
      seen.add(lower);

      writers.push(toTitleCase(name));
    }
  }

  return { title, writers };
}

function toTitleCase(str: string): string {
  const minorWords = new Set([
    "a", "an", "and", "as", "at", "but", "by", "for", "in",
    "nor", "of", "on", "or", "so", "the", "to", "up", "yet",
  ]);

  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}
