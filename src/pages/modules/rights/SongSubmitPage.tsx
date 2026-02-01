import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  AppPageContainer,
  AppSection,
  AppButton,
  AppInput,
  AppSelect,
} from "@/components/app-ui";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * SONG SUBMIT PAGE — ADD NEW SONG TO CATALOGUE
 * 
 * Institutional-grade form for adding songs to the master catalogue.
 * Follows the flat, professional design standards.
 */

interface SongFormData {
  title: string;
  alternate_titles: string[];
  iswc: string;
  language: string;
  genre: string;
  release_date: string;
  duration_seconds: string;
  metadata: Record<string, string>;
}

const initialFormData: SongFormData = {
  title: "",
  alternate_titles: [],
  iswc: "",
  language: "EN",
  genre: "",
  release_date: "",
  duration_seconds: "",
  metadata: {},
};

const languageOptions = [
  { value: "EN", label: "English" },
  { value: "ES", label: "Spanish" },
  { value: "FR", label: "French" },
  { value: "DE", label: "German" },
  { value: "IT", label: "Italian" },
  { value: "PT", label: "Portuguese" },
  { value: "JA", label: "Japanese" },
  { value: "KO", label: "Korean" },
  { value: "ZH", label: "Chinese" },
  { value: "OTHER", label: "Other" },
];

export default function SongSubmitPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SongFormData>(initialFormData);
  const [newAlternateTitle, setNewAlternateTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SongFormData, string>>>({});

  const handleInputChange = (field: keyof SongFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddAlternateTitle = () => {
    if (newAlternateTitle.trim()) {
      setFormData(prev => ({
        ...prev,
        alternate_titles: [...prev.alternate_titles, newAlternateTitle.trim()],
      }));
      setNewAlternateTitle("");
    }
  };

  const handleRemoveAlternateTitle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternate_titles: prev.alternate_titles.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SongFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // ISWC format validation (optional but if provided, should be valid)
    if (formData.iswc && !/^T-\d{3}\.\d{3}\.\d{3}-\d$/.test(formData.iswc)) {
      newErrors.iswc = "Invalid ISWC format (e.g., T-123.456.789-0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("songs")
        .insert({
          title: formData.title.trim(),
          alternate_titles: formData.alternate_titles.length > 0 ? formData.alternate_titles : null,
          iswc: formData.iswc.trim() || null,
          language: formData.language || null,
          genre: formData.genre.trim() || null,
          release_date: formData.release_date || null,
          duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds) : null,
          metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : null,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Song added to catalogue");
      navigate("/rights/catalogue");
    } catch (error: any) {
      console.error("Error adding song:", error);
      toast.error(error.message || "Failed to add song");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppPageContainer maxWidth="md">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/rights/catalogue")}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back to catalogue"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Add Song</h1>
        </div>
        <AppButton
          intent="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save"}
        </AppButton>
      </div>

      <AppSection spacing="md">
        {/* Title - Required */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-[13px] font-medium">
            Title <span className="text-destructive">*</span>
          </Label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter song title"
            className={cn(
              "w-full h-10 px-3",
              "text-[14px]",
              "bg-transparent border rounded-md",
              errors.title ? "border-destructive" : "border-border",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-1",
              errors.title ? "focus:ring-destructive" : "focus:ring-ring",
              "transition-colors"
            )}
          />
          {errors.title && (
            <p className="text-[12px] text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Alternate Titles */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium">Alternate Titles</Label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAlternateTitle}
              onChange={(e) => setNewAlternateTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAlternateTitle();
                }
              }}
              placeholder="Add alternate title"
              className={cn(
                "flex-1 h-10 px-3",
                "text-[14px]",
                "bg-transparent border border-border rounded-md",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                "transition-colors"
              )}
            />
            <AppButton
              intent="secondary"
              size="sm"
              onClick={handleAddAlternateTitle}
              disabled={!newAlternateTitle.trim()}
            >
              <Plus className="h-4 w-4" />
            </AppButton>
          </div>
          {formData.alternate_titles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.alternate_titles.map((title, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[12px] bg-muted rounded-md"
                >
                  {title}
                  <button
                    onClick={() => handleRemoveAlternateTitle(index)}
                    className="p-0.5 hover:bg-muted-foreground/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ISWC */}
        <div className="space-y-1.5">
          <Label htmlFor="iswc" className="text-[13px] font-medium">
            ISWC
          </Label>
          <input
            id="iswc"
            type="text"
            value={formData.iswc}
            onChange={(e) => handleInputChange("iswc", e.target.value)}
            placeholder="T-123.456.789-0"
            className={cn(
              "w-full h-10 px-3",
              "text-[14px] font-mono",
              "bg-transparent border rounded-md",
              errors.iswc ? "border-destructive" : "border-border",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-1",
              errors.iswc ? "focus:ring-destructive" : "focus:ring-ring",
              "transition-colors"
            )}
          />
          {errors.iswc && (
            <p className="text-[12px] text-destructive">{errors.iswc}</p>
          )}
          <p className="text-[11px] text-muted-foreground">
            International Standard Musical Work Code
          </p>
        </div>

        {/* Language & Genre Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-[13px] font-medium">
              Language
            </Label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className={cn(
                "w-full h-10 px-3",
                "text-[14px]",
                "bg-transparent border border-border rounded-md",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                "transition-colors"
              )}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="genre" className="text-[13px] font-medium">
              Genre
            </Label>
            <input
              id="genre"
              type="text"
              value={formData.genre}
              onChange={(e) => handleInputChange("genre", e.target.value)}
              placeholder="e.g., Pop, Rock, Jazz"
              className={cn(
                "w-full h-10 px-3",
                "text-[14px]",
                "bg-transparent border border-border rounded-md",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                "transition-colors"
              )}
            />
          </div>
        </div>

        {/* Release Date & Duration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="release_date" className="text-[13px] font-medium">
              Release Date
            </Label>
            <input
              id="release_date"
              type="date"
              value={formData.release_date}
              onChange={(e) => handleInputChange("release_date", e.target.value)}
              className={cn(
                "w-full h-10 px-3",
                "text-[14px]",
                "bg-transparent border border-border rounded-md",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                "transition-colors"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-[13px] font-medium">
              Duration (seconds)
            </Label>
            <input
              id="duration"
              type="number"
              min="0"
              value={formData.duration_seconds}
              onChange={(e) => handleInputChange("duration_seconds", e.target.value)}
              placeholder="e.g., 210"
              className={cn(
                "w-full h-10 px-3",
                "text-[14px]",
                "bg-transparent border border-border rounded-md",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                "transition-colors"
              )}
            />
          </div>
        </div>
      </AppSection>

      {/* Footer Actions - Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex gap-3">
          <AppButton
            intent="secondary"
            size="md"
            onClick={() => navigate("/rights/catalogue")}
            className="flex-1"
          >
            Cancel
          </AppButton>
          <AppButton
            intent="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : "Save Song"}
          </AppButton>
        </div>
      </div>
    </AppPageContainer>
  );
}
