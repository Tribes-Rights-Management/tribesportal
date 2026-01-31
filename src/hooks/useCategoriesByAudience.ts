import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * HOOK: useCategoriesByAudience
 * 
 * Fetches categories linked to a specific audience via the 
 * help_category_audiences junction table.
 */

export interface CategoryForAudience {
  id: string;
  name: string;
  slug: string;
  position: number;
}

interface UseCategoriesByAudienceResult {
  categories: CategoryForAudience[];
  loading: boolean;
  error: string | null;
  fetchCategoriesByAudience: (audienceId: string) => Promise<CategoryForAudience[]>;
}

export function useCategoriesByAudience(): UseCategoriesByAudienceResult {
  const [categories, setCategories] = useState<CategoryForAudience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoriesByAudience = useCallback(async (audienceId: string): Promise<CategoryForAudience[]> => {
    if (!audienceId) {
      setCategories([]);
      return [];
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("help_category_audiences")
      .select(`
        category_id,
        position,
        help_categories (
          id,
          name,
          slug
        )
      `)
      .eq("audience_id", audienceId)
      .order("position", { ascending: true });

    if (fetchError) {
      console.error("Error fetching categories by audience:", fetchError);
      setError("Unable to load categories");
      setLoading(false);
      return [];
    }

    const mapped: CategoryForAudience[] = (data || [])
      .filter(row => row.help_categories)
      .map(row => ({
        id: (row.help_categories as any).id,
        name: (row.help_categories as any).name,
        slug: (row.help_categories as any).slug,
        position: row.position,
      }));

    setCategories(mapped);
    setLoading(false);
    return mapped;
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategoriesByAudience,
  };
}
