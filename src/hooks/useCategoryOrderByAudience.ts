import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * HOOK: useCategoryOrderByAudience
 * 
 * Fetches categories for a specific audience, ordered by position,
 * and allows reordering with position persistence.
 */

export interface CategoryWithPosition {
  id: string;
  name: string;
  slug: string;
  updated_at: string;
  linkId: string; // help_category_audiences.id
  position: number;
}

interface UseCategoryOrderByAudienceResult {
  categories: CategoryWithPosition[];
  loading: boolean;
  error: string | null;
  fetchCategoriesForAudience: (audienceId: string) => Promise<void>;
  updatePositions: (audienceId: string, orderedCategories: CategoryWithPosition[]) => Promise<boolean>;
}

export function useCategoryOrderByAudience(): UseCategoryOrderByAudienceResult {
  const [categories, setCategories] = useState<CategoryWithPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all categories linked to a specific audience, ordered by position
   */
  const fetchCategoriesForAudience = useCallback(async (audienceId: string): Promise<void> => {
    if (!audienceId) {
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("help_category_audiences")
      .select(`
        id,
        position,
        category_id,
        help_categories (
          id,
          name,
          slug,
          updated_at
        )
      `)
      .eq("audience_id", audienceId)
      .order("position", { ascending: true });

    if (fetchError) {
      console.error("Error fetching categories for audience:", fetchError);
      setError("Unable to load categories");
      setLoading(false);
      return;
    }

    const mapped: CategoryWithPosition[] = (data || [])
      .filter(row => row.help_categories)
      .map(row => ({
        id: (row.help_categories as any).id,
        name: (row.help_categories as any).name,
        slug: (row.help_categories as any).slug,
        updated_at: (row.help_categories as any).updated_at,
        linkId: row.id,
        position: row.position,
      }));

    setCategories(mapped);
    setLoading(false);
  }, []);

  /**
   * Update positions for all categories in the given order
   */
  const updatePositions = useCallback(async (
    audienceId: string,
    orderedCategories: CategoryWithPosition[]
  ): Promise<boolean> => {
    if (!audienceId || orderedCategories.length === 0) return false;

    setLoading(true);
    setError(null);

    try {
      // Update each link's position
      const updates = orderedCategories.map((cat, index) => 
        supabase
          .from("help_category_audiences")
          .update({ position: index })
          .eq("id", cat.linkId)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(r => r.error);

      if (hasError) {
        throw new Error("Failed to update some positions");
      }

      // Update local state with new positions
      setCategories(orderedCategories.map((cat, index) => ({
        ...cat,
        position: index,
      })));

      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error updating category positions:", err);
      setError("Unable to save order");
      setLoading(false);
      return false;
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategoriesForAudience,
    updatePositions,
  };
}
