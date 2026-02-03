import { useState, useCallback } from "react";

const ALGOLIA_APP_ID = "8WVEYVACJ3";
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

interface AlgoliaHit {
  objectID: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  pro: string | null;
  ipi_number: string | null;
  email: string | null;
  created_at: string;
}

interface AlgoliaSearchResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

interface UseAlgoliaSearchOptions {
  indexName: string;
  hitsPerPage?: number;
}

export function useAlgoliaSearch<T extends { id: string }>({ 
  indexName, 
  hitsPerPage = 50 
}: UseAlgoliaSearchOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = Boolean(ALGOLIA_SEARCH_KEY);

  const search = useCallback(async (
    query: string, 
    page: number = 0
  ): Promise<{ hits: T[]; totalHits: number; totalPages: number } | null> => {
    if (!ALGOLIA_SEARCH_KEY) {
      console.warn("Algolia search key not configured, falling back to Supabase");
      return null;
    }

    if (!query.trim()) {
      return null; // Empty query, use Supabase pagination
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/query`,
        {
          method: 'POST',
          headers: {
            'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            page,
            hitsPerPage,
            attributesToRetrieve: [
              'objectID',
              'name',
              'first_name',
              'last_name',
              'pro',
              'ipi_number',
              'email',
              'created_at',
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Algolia search failed: ${response.status}`);
      }

      const data: AlgoliaSearchResponse = await response.json();

      // Transform Algolia hits to match our Writer interface
      const hits = data.hits.map(hit => ({
        id: hit.objectID,
        name: hit.name,
        first_name: hit.first_name,
        last_name: hit.last_name,
        pro: hit.pro,
        ipi_number: hit.ipi_number,
        cae_number: null,
        email: hit.email,
        created_at: hit.created_at,
      })) as unknown as T[];

      return {
        hits,
        totalHits: data.nbHits,
        totalPages: data.nbPages,
      };

    } catch (err) {
      console.error('Algolia search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      return null; // Fallback to Supabase
    } finally {
      setLoading(false);
    }
  }, [indexName, hitsPerPage]);

  return {
    search,
    loading,
    error,
    isConfigured,
  };
}
