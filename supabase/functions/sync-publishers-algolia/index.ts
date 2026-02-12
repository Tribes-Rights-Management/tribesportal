import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALGOLIA_APP_ID = Deno.env.get("ALGOLIA_APP_ID") || "8WVEYVACJ3";
const ALGOLIA_ADMIN_KEY = Deno.env.get("ALGOLIA_ADMIN_KEY");
const ALGOLIA_INDEX = "publishers";

async function syncToAlgolia(records: any[], action: "upsert" | "delete") {
  if (!ALGOLIA_ADMIN_KEY) {
    throw new Error("ALGOLIA_ADMIN_KEY not configured");
  }

  const url = `https://${ALGOLIA_APP_ID}.algolia.net/1/indexes/${ALGOLIA_INDEX}/batch`;

  const requests = records.map((record) => {
    if (action === "delete") {
      return { action: "deleteObject", body: { objectID: record.id } };
    }
    return {
      action: "updateObject",
      body: {
        objectID: record.id,
        name: record.name,
        legal_name: record.legal_name,
        dba_name: record.dba_name,
        ipi_number: record.ipi_number,
        isni: record.isni,
        pro: record.pro,
        pro_member_id: record.pro_member_id,
        publisher_type: record.publisher_type,
        contact_name: record.contact_name,
        email: record.email,
        phone: record.phone,
        city: record.city,
        state: record.state,
        country: record.country,
        is_controlled: record.is_controlled,
        is_active: record.is_active,
      },
    };
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Algolia-API-Key": ALGOLIA_ADMIN_KEY,
      "X-Algolia-Application-Id": ALGOLIA_APP_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Algolia sync failed: ${error}`);
  }

  return response.json();
}

async function fullSync(supabase: any) {
  const { data: publishers, error } = await supabase
    .from("publishers")
    .select("id, name, legal_name, dba_name, ipi_number, isni, pro, pro_member_id, publisher_type, contact_name, email, phone, city, state, country, is_controlled, is_active")
    .order("name")
    .limit(10000);

  if (error) throw new Error(`Failed to fetch publishers: ${error.message}`);
  if (!publishers || publishers.length === 0) return { message: "No publishers to sync", count: 0 };

  const batchSize = 1000;
  let synced = 0;

  for (let i = 0; i < publishers.length; i += batchSize) {
    const batch = publishers.slice(i, i + batchSize);
    await syncToAlgolia(batch, "upsert");
    synced += batch.length;
  }

  return { message: "Full sync complete", count: synced };
}

async function singleSync(supabase: any, publisherId: string, action: "upsert" | "delete") {
  if (action === "delete") {
    await syncToAlgolia([{ id: publisherId }], "delete");
    return { message: `Publisher ${publisherId} deleted from Algolia` };
  }

  const { data: publisher, error } = await supabase
    .from("publishers")
    .select("id, name, legal_name, dba_name, ipi_number, isni, pro, pro_member_id, publisher_type, contact_name, email, phone, city, state, country, is_controlled, is_active")
    .eq("id", publisherId)
    .single();

  if (error) throw new Error(`Failed to fetch publisher: ${error.message}`);
  
  await syncToAlgolia([publisher], "upsert");
  return { message: `Publisher ${publisher.name} synced to Algolia` };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body = full sync
    }

    const action = body.action || "full_sync";

    let result;
    if (action === "full_sync") {
      result = await fullSync(supabase);
    } else {
      const publisherId = body.publisher_id;
      if (!publisherId) throw new Error("publisher_id required for single sync");
      result = await singleSync(supabase, publisherId, action);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});