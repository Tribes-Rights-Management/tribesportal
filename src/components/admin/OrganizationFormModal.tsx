import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
  AppModalCancel,
  AppModalField,
  AppModalFields,
} from "@/components/ui/app-modal";

/**
 * ORGANIZATION FORM MODAL — USES UNIFIED APP MODAL SYSTEM
 * 
 * Features:
 * - Real-time slug validation
 * - Auto-generate slug from name
 * - Inline validation errors
 * - Sticky footer on mobile
 * - Safe-area aware padding
 */

interface OrganizationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; slug: string }) => Promise<void>;
  initialData?: { name: string; slug: string } | null;
  mode: "create" | "edit";
}

interface ValidationState {
  name: string | null;
  slug: string | null;
}

export function OrganizationFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: OrganizationFormModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationState>({ name: null, slug: null });

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setSlug(initialData?.slug || "");
      setSlugTouched(!!initialData?.slug);
      setErrors({ name: null, slug: null });
    }
  }, [open, initialData]);

  // Auto-generate slug from name (only if slug hasn't been manually touched)
  const generateSlug = useCallback((value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    
    // Validate name
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }));
    } else if (value.trim().length < 2) {
      setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }));
    } else if (value.trim().length > 100) {
      setErrors(prev => ({ ...prev, name: "Name must be less than 100 characters" }));
    } else {
      setErrors(prev => ({ ...prev, name: null }));
    }
    
    // Auto-generate slug if not manually touched
    if (!slugTouched) {
      const newSlug = generateSlug(value);
      setSlug(newSlug);
      validateSlug(newSlug);
    }
  };

  const validateSlug = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, slug: "Slug is required" }));
      return false;
    }
    
    if (value.length < 3) {
      setErrors(prev => ({ ...prev, slug: "Slug must be at least 3 characters" }));
      return false;
    }
    
    if (value.length > 50) {
      setErrors(prev => ({ ...prev, slug: "Slug must be less than 50 characters" }));
      return false;
    }
    
    if (!/^[a-z]/.test(value)) {
      setErrors(prev => ({ ...prev, slug: "Slug must start with a letter" }));
      return false;
    }
    
    if (!/^[a-z0-9-]+$/.test(value)) {
      setErrors(prev => ({ ...prev, slug: "Only lowercase letters, numbers, and hyphens allowed" }));
      return false;
    }
    
    if (/--/.test(value)) {
      setErrors(prev => ({ ...prev, slug: "Consecutive hyphens not allowed" }));
      return false;
    }
    
    if (/-$/.test(value)) {
      setErrors(prev => ({ ...prev, slug: "Slug cannot end with a hyphen" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, slug: null }));
    return true;
  };

  const handleSlugChange = (value: string) => {
    // Normalize: lowercase, strip invalid chars except hyphens
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(normalized);
    setSlugTouched(true);
    validateSlug(normalized);
  };

  const isValid = 
    name.trim().length >= 2 && 
    name.trim().length <= 100 &&
    slug.length >= 3 && 
    slug.length <= 50 &&
    /^[a-z][a-z0-9-]*[a-z0-9]$/.test(slug) &&
    !/--/.test(slug) &&
    !errors.name && 
    !errors.slug;

  const handleSubmit = async () => {
    if (!isValid || saving) return;
    
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), slug: slug.trim() });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit organization" : "Add organization"}
      description={mode === "edit" ? "Update organization details." : "Create a new organization."}
      preventClose={saving}
      maxWidth="sm"
    >
      <AppModalBody>
        <AppModalFields>
          {/* Name Field */}
          <AppModalField
            label="Name"
            htmlFor="org-name"
            error={errors.name}
          >
            <Input
              id="org-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Publishing"
              autoComplete="organization"
              autoCapitalize="words"
              className="h-12 md:h-11 text-[16px] md:text-[14px] bg-transparent text-white placeholder:text-white/30 pr-12"
              style={{ 
                border: errors.name ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
              }}
            />
          </AppModalField>

          {/* Slug Field */}
          <AppModalField
            label="Slug"
            htmlFor="org-slug"
            error={errors.slug}
            helpText={!errors.slug ? "URL-friendly identifier. Must be unique." : undefined}
          >
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="acme-publishing"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 md:h-11 text-[16px] md:text-[14px] font-mono bg-transparent text-white placeholder:text-white/30 pr-12"
              style={{ 
                border: errors.slug ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
              }}
            />
          </AppModalField>
        </AppModalFields>
      </AppModalBody>

      <AppModalFooter>
        <AppModalAction
          onClick={handleSubmit}
          disabled={!isValid}
          loading={saving}
          loadingText={mode === "edit" ? "Updating…" : "Creating…"}
        >
          {mode === "edit" ? "Update" : "Create"}
        </AppModalAction>
        
        <AppModalCancel onClick={() => onOpenChange(false)} disabled={saving}>
          Cancel
        </AppModalCancel>
      </AppModalFooter>
    </AppModal>
  );
}
