import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * HOOK: useCategoryAudiences
 * 
 * Manages the relationship between categories and audiences
 * via the help_category_audiences junction table.
 */

export interface CategoryAudienceLink {
  id: string;
  category_id: string;
  audience_id: string;
  position: number;
}

interface UseCategoryAudiencesResult {
  links: CategoryAudienceLink[];
  loading: boolean;
  error: string | null;
  fetchAudiencesForCategory: (categoryId: string) => Promise<string[]>;
  syncCategoryAudiences: (categoryId: string, audienceIds: string[]) => Promise<boolean>;
}

export function useCategoryAudiences(): UseCategoryAudiencesResult {
  const [links, setLinks] = useState<CategoryAudienceLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all audience IDs linked to a specific category
   */
  const fetchAudiencesForCategory = useCallback(async (categoryId: string): Promise<string[]> => {
    if (!categoryId) return [];

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("help_category_audiences")
      .select("audience_id")
      .eq("category_id", categoryId);

    if (fetchError) {
      console.error("Error fetching category audiences:", fetchError);
      setError("Unable to load audience links");
      setLoading(false);
      return [];
    }

    const audienceIds = (data || []).map(row => row.audience_id);
    setLoading(false);
    return audienceIds;
  }, []);

  /**
   * Sync category-audience relationships:
   * - Insert new links
   * - Delete removed links
   */
  const syncCategoryAudiences = useCallback(async (
    categoryId: string, 
    audienceIds: string[]
  ): Promise<boolean> => {
    if (!categoryId) return false;

    setLoading(true);
    setError(null);

    try {
      // Fetch existing links
      const { data: existing, error: fetchError } = await supabase
        .from("help_category_audiences")
        .select("id, audience_id")
        .eq("category_id", categoryId);

      if (fetchError) {
        throw fetchError;
      }

      const existingAudienceIds = (existing || []).map(e => e.audience_id);
      const existingMap = new Map((existing || []).map(e => [e.audience_id, e.id]));

      // Determine additions and removals
      const toAdd = audienceIds.filter(id => !existingAudienceIds.includes(id));
      const toRemove = existingAudienceIds.filter(id => !audienceIds.includes(id));

      // Insert new links
      if (toAdd.length > 0) {
        const inserts = toAdd.map((audienceId, index) => ({
          category_id: categoryId,
          audience_id: audienceId,
          position: index,
        }));

        const { error: insertError } = await supabase
          .from("help_category_audiences")
          .insert(inserts);

        if (insertError) {
          throw insertError;
        }
      }

      // Delete removed links
      if (toRemove.length > 0) {
        const idsToDelete = toRemove.map(aid => existingMap.get(aid)).filter(Boolean);
        
        const { error: deleteError } = await supabase
          .from("help_category_audiences")
          .delete()
          .in("id", idsToDelete as string[]);

        if (deleteError) {
          throw deleteError;
        }
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error syncing category audiences:", err);
      setError("Unable to save audience links");
      setLoading(false);
      return false;
    }
  }, []);

  return {
    links,
    loading,
    error,
    fetchAudiencesForCategory,
    syncCategoryAudiences,
  };
}
