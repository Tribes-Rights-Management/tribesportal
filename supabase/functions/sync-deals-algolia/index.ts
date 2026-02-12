import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALGOLIA_APP_ID = Deno.env.get("ALGOLIA_APP_ID") || "8WVEYVACJ3";
const ALGOLIA_ADMIN_KEY = Deno.env.get("ALGOLIA_ADMIN_KEY");
const ALGOLIA_INDEX = "deals";

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
        deal_number: record.deal_number,
        territory: record.territory,
        territory_mode: record.territory_mode,
        status: record.status,
        effective_date: record.effective_date,
        end_date: record.end_date,
        writer_share: record.writer_share,
        writer_id: record.writer_id,
        writer_name: record.writer_name,
        writer_pro: record.writer_pro,
        publishers: record.publishers,
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
  // Fetch deals with writer info
  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .select(`
      id, name, deal_number, territory, territory_mode, status,
      effective_date, end_date, writer_share, writer_id,
      writers!deals_writer_id_fkey ( name, pro )
    `)
    .order("deal_number")
    .limit(10000);

  if (dealsError) throw new Error(`Failed to fetch deals: ${dealsError.message}`);
  if (!deals || deals.length === 0) return { message: "No deals to sync", count: 0 };

  // Fetch all deal publishers in one query
  const dealIds = deals.map((d: any) => d.id);
  const { data: allPublishers, error: pubError } = await supabase
    .from("deal_publishers")
    .select("deal_id, publisher_name, publisher_pro, share, tribes_administered, sort_order")
    .in("deal_id", dealIds)
    .order("sort_order");

  if (pubError) throw new Error(`Failed to fetch deal publishers: ${pubError.message}`);

  // Group publishers by deal_id
  const pubsByDeal: Record<string, any[]> = {};
  for (const pub of (allPublishers || [])) {
    if (!pubsByDeal[pub.deal_id]) pubsByDeal[pub.deal_id] = [];
    pubsByDeal[pub.deal_id].push({
      name: pub.publisher_name,
      pro: pub.publisher_pro,
      share: pub.share,
      tribes_administered: pub.tribes_administered,
    });
  }

  // Flatten for Algolia
  const records = deals.map((deal: any) => ({
    id: deal.id,
    name: deal.name,
    deal_number: deal.deal_number,
    territory: deal.territory,
    territory_mode: deal.territory_mode,
    status: deal.status,
    effective_date: deal.effective_date,
    end_date: deal.end_date,
    writer_share: deal.writer_share,
    writer_id: deal.writer_id,
    writer_name: deal.writers?.name || null,
    writer_pro: deal.writers?.pro || null,
    publishers: pubsByDeal[deal.id] || [],
  }));

  const batchSize = 1000;
  let synced = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await syncToAlgolia(batch, "upsert");
    synced += batch.length;
  }

  return { message: "Full sync complete", count: synced };
}

async function singleSync(supabase: any, dealId: string, action: "upsert" | "delete") {
  if (action === "delete") {
    await syncToAlgolia([{ id: dealId }], "delete");
    return { message: `Deal ${dealId} deleted from Algolia` };
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select(`
      id, name, deal_number, territory, territory_mode, status,
      effective_date, end_date, writer_share, writer_id,
      writers!deals_writer_id_fkey ( name, pro )
    `)
    .eq("id", dealId)
    .single();

  if (dealError) throw new Error(`Failed to fetch deal: ${dealError.message}`);

  const { data: publishers, error: pubError } = await supabase
    .from("deal_publishers")
    .select("publisher_name, publisher_pro, share, tribes_administered, sort_order")
    .eq("deal_id", dealId)
    .order("sort_order");

  if (pubError) throw new Error(`Failed to fetch deal publishers: ${pubError.message}`);

  const record = {
    id: deal.id,
    name: deal.name,
    deal_number: deal.deal_number,
    territory: deal.territory,
    territory_mode: deal.territory_mode,
    status: deal.status,
    effective_date: deal.effective_date,
    end_date: deal.end_date,
    writer_share: deal.writer_share,
    writer_id: deal.writer_id,
    writer_name: deal.writers?.name || null,
    writer_pro: deal.writers?.pro || null,
    publishers: (publishers || []).map((p: any) => ({
      name: p.publisher_name,
      pro: p.publisher_pro,
      share: p.share,
      tribes_administered: p.tribes_administered,
    })),
  };

  await syncToAlgolia([record], "upsert");
  return { message: `Deal ${deal.name} synced to Algolia` };
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
      const dealId = body.deal_id;
      if (!dealId) throw new Error("deal_id required for single sync");
      result = await singleSync(supabase, dealId, action);
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