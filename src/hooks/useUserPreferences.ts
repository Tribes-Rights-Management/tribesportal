import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * USER PREFERENCES HOOK
 * 
 * Manages user preferences with Supabase persistence.
 * Falls back to localStorage if database is unavailable.
 * 
 * Preferences:
 * - display_name: User's display name (shown in activity logs)
 * - timezone: User's timezone preference
 * - date_format: Date display format preference
 * - time_format: 12-hour or 24-hour time format
 * - inactivity_timeout_minutes: User-preferred session timeout
 * - ui_density_mode: Visual density preference (comfortable/compact)
 */

export interface UserPreferences {
  display_name: string | null;
  timezone: string;
  date_format: "iso8601" | "us" | "eu";
  time_format: "12h" | "24h";
  inactivity_timeout_minutes: number;
  ui_density_mode: "comfortable" | "compact";
}

const DEFAULT_PREFERENCES: UserPreferences = {
  display_name: null,
  timezone: "auto",
  date_format: "iso8601",
  time_format: "24h",
  inactivity_timeout_minutes: 30,
  ui_density_mode: "comfortable",
};

const STORAGE_KEY = "tribes_user_preferences";

// Date format display labels
export const DATE_FORMAT_OPTIONS = [
  { value: "iso8601", label: "ISO 8601 (YYYY-MM-DD)" },
  { value: "us", label: "US (MM/DD/YYYY)" },
  { value: "eu", label: "EU (DD/MM/YYYY)" },
] as const;

// Time format display labels
export const TIME_FORMAT_OPTIONS = [
  { value: "24h", label: "24-hour" },
  { value: "12h", label: "12-hour" },
] as const;

// Inactivity timeout options (in minutes)
export const INACTIVITY_TIMEOUT_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
] as const;

// Common timezone options
export const TIMEZONE_OPTIONS = [
  { value: "auto", label: "System default (auto-detected)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
] as const;

// UI Density options
export const UI_DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact (more rows on screen)" },
] as const;

export function useUserPreferences() {
  const { user, profile } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Workspace policy overrides (comes from tenant settings via AppUiBoot)
  const [policyOverrides, setPolicyOverridesState] = useState<Partial<UserPreferences>>({});

  // Stable setter for policy overrides
  const setPolicyOverrides = useCallback((overrides: Partial<UserPreferences>) => {
    setPolicyOverridesState(overrides);
  }, []);

  // Load preferences from database
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        // Try to load from user_preferences table
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load preferences from DB:", error);
          // Fallback to localStorage
          const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
          }
        } else if (data) {
          setPreferences({
            display_name: data.display_name,
            timezone: data.timezone,
            date_format: data.date_format as "iso8601" | "us" | "eu",
            time_format: data.time_format as "12h" | "24h",
            inactivity_timeout_minutes: data.inactivity_timeout_minutes,
            ui_density_mode: (data.ui_density_mode ?? "comfortable") as "comfortable" | "compact",
          });
        } else {
          // No preferences found, use defaults (possibly with display_name from profile)
          if (profile?.full_name) {
            setPreferences(prev => ({
              ...prev,
              display_name: profile.full_name,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id, profile?.full_name]);

  // Save preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user?.id) {
      toast({ description: "Not authenticated", variant: "destructive" });
      return false;
    }

    setSaving(true);
    try {
      const newPreferences = { ...preferences, ...updates };
      
      // Upsert to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          display_name: newPreferences.display_name,
          timezone: newPreferences.timezone,
          date_format: newPreferences.date_format,
          time_format: newPreferences.time_format,
          inactivity_timeout_minutes: newPreferences.inactivity_timeout_minutes,
          ui_density_mode: newPreferences.ui_density_mode,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Failed to save to DB:", error);
        // Fallback to localStorage
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newPreferences));
      }
      
      setPreferences(newPreferences);
      toast({ description: "Preferences saved" });
      return true;
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast({ description: "Failed to save preferences", variant: "destructive" });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user?.id, preferences]);

  // Get effective preference (considering policy overrides)
  const getEffective = useCallback(<K extends keyof UserPreferences>(key: K): UserPreferences[K] => {
    if (key in policyOverrides) {
      return policyOverrides[key] as UserPreferences[K];
    }
    return preferences[key];
  }, [preferences, policyOverrides]);

  // Check if a preference is locked by policy
  const isLocked = useCallback((key: keyof UserPreferences): boolean => {
    return key in policyOverrides;
  }, [policyOverrides]);

  // Format date according to user preference
  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const format = getEffective("date_format");
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    switch (format) {
      case "us":
        return `${month}/${day}/${year}`;
      case "eu":
        return `${day}/${month}/${year}`;
      case "iso8601":
      default:
        return `${year}-${month}-${day}`;
    }
  }, [getEffective]);

  // Format time according to user preference
  const formatTime = useCallback((date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const format = getEffective("time_format");
    
    if (format === "12h") {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [getEffective]);

  // Get display name label
  const getTimezoneLabel = useCallback((value: string): string => {
    const option = TIMEZONE_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  }, []);

  const getDateFormatLabel = useCallback((value: string): string => {
    const option = DATE_FORMAT_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  }, []);

  const getTimeFormatLabel = useCallback((value: string): string => {
    const option = TIME_FORMAT_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  }, []);

  const getInactivityTimeoutLabel = useCallback((value: number): string => {
    const option = INACTIVITY_TIMEOUT_OPTIONS.find(opt => opt.value === value);
    return option?.label || `${value} minutes`;
  }, []);

  const getUiDensityLabel = useCallback((value: string): string => {
    const option = UI_DENSITY_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  }, []);

  // Return preferences with policy overrides applied
  const effectivePreferences: UserPreferences = {
    display_name: getEffective("display_name"),
    timezone: getEffective("timezone"),
    date_format: getEffective("date_format"),
    time_format: getEffective("time_format"),
    inactivity_timeout_minutes: getEffective("inactivity_timeout_minutes"),
    ui_density_mode: getEffective("ui_density_mode"),
  };

  return {
    preferences: effectivePreferences,
    loading,
    saving,
    updatePreferences,
    getEffective,
    isLocked,
    setPolicyOverrides,
    formatDate,
    formatTime,
    getTimezoneLabel,
    getDateFormatLabel,
    getTimeFormatLabel,
    getInactivityTimeoutLabel,
    getUiDensityLabel,
    // Options for selectors
    DATE_FORMAT_OPTIONS,
    TIME_FORMAT_OPTIONS,
    TIMEZONE_OPTIONS,
    INACTIVITY_TIMEOUT_OPTIONS,
    UI_DENSITY_OPTIONS,
  };
}
