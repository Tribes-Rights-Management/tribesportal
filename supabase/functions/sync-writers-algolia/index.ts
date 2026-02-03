import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALGOLIA_APP_ID = Deno.env.get('ALGOLIA_APP_ID');
const ALGOLIA_ADMIN_KEY = Deno.env.get('ALGOLIA_ADMIN_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Writer {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  pro: string | null;
  ipi_number: string | null;
  cae_number: string | null;
  email: string | null;
  created_at: string;
}

interface AlgoliaRecord {
  objectID: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  pro: string | null;
  ipi_number: string | null;
  email: string | null;
  created_at: string;
}

async function indexToAlgolia(records: AlgoliaRecord[]): Promise<{ taskID: number }> {
  const response = await fetch(
    `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/writers/batch`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY!,
        'X-Algolia-Application-Id': ALGOLIA_APP_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: records.map(record => ({
          action: 'updateObject',
          body: record,
        })),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Algolia indexing failed: ${error}`);
  }

  return response.json();
}

async function deleteFromAlgolia(objectIDs: string[]): Promise<{ taskID: number }> {
  const response = await fetch(
    `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/writers/batch`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY!,
        'X-Algolia-Application-Id': ALGOLIA_APP_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: objectIDs.map(objectID => ({
          action: 'deleteObject',
          body: { objectID },
        })),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Algolia deletion failed: ${error}`);
  }

  return response.json();
}

function writerToAlgoliaRecord(writer: Writer): AlgoliaRecord {
  return {
    objectID: writer.id,
    name: writer.name,
    first_name: writer.first_name,
    last_name: writer.last_name,
    pro: writer.pro,
    ipi_number: writer.ipi_number || writer.cae_number,
    email: writer.email,
    created_at: writer.created_at,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate Algolia credentials
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
      throw new Error('Algolia credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'full_sync';
    const writerId = body.writer_id;

    console.log(`Sync action: ${action}, writer_id: ${writerId || 'N/A'}`);

    if (action === 'full_sync') {
      // Full sync: fetch all writers and index them
      const { data: writers, error } = await supabase
        .from('writers')
        .select('id, name, first_name, last_name, pro, ipi_number, cae_number, email, created_at')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch writers: ${error.message}`);
      }

      if (!writers || writers.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No writers to sync', count: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Batch in chunks of 1000 (Algolia limit)
      const BATCH_SIZE = 1000;
      let totalIndexed = 0;

      for (let i = 0; i < writers.length; i += BATCH_SIZE) {
        const batch = writers.slice(i, i + BATCH_SIZE);
        const records = batch.map(writerToAlgoliaRecord);
        await indexToAlgolia(records);
        totalIndexed += batch.length;
        console.log(`Indexed batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} writers`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Full sync completed', count: totalIndexed }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'upsert' && writerId) {
      // Single writer upsert
      const { data: writer, error } = await supabase
        .from('writers')
        .select('id, name, first_name, last_name, pro, ipi_number, cae_number, email, created_at')
        .eq('id', writerId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch writer: ${error.message}`);
      }

      const record = writerToAlgoliaRecord(writer);
      await indexToAlgolia([record]);

      return new Response(
        JSON.stringify({ success: true, message: 'Writer indexed', writer_id: writerId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'delete' && writerId) {
      // Delete writer from index
      await deleteFromAlgolia([writerId]);

      return new Response(
        JSON.stringify({ success: true, message: 'Writer deleted from index', writer_id: writerId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      throw new Error(`Invalid action: ${action}. Valid actions: full_sync, upsert, delete`);
    }

  } catch (error) {
    console.error('Sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
