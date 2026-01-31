import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  linkId: string;
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

  const updatePositions = useCallback(async (
    audienceId: string,
    orderedCategories: CategoryWithPosition[]
  ): Promise<boolean> => {
    if (!audienceId || orderedCategories.length === 0) return false;

    // Optimistically update local state
    setCategories(orderedCategories.map((cat, index) => ({
      ...cat,
      position: index + 1,
    })));

    try {
      // Batch update all positions
      const updates = orderedCategories.map((cat, index) => 
        supabase
          .from("help_category_audiences")
          .update({ position: index + 1 })
          .eq("id", cat.linkId)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(r => r.error);

      if (hasError) {
        throw new Error("Failed to update some positions");
      }

      toast.success("Saved", { duration: 1500 });
      return true;
    } catch (err) {
      console.error("Error updating category positions:", err);
      setError("Unable to save order");
      toast.error("Failed to save order");
      // Refetch to restore correct state
      await fetchCategoriesForAudience(audienceId);
      return false;
    }
  }, [fetchCategoriesForAudience]);

  return {
    categories,
    loading,
    error,
    fetchCategoriesForAudience,
    updatePositions,
  };
}
