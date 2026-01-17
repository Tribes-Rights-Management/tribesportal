import { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * ORGANIZATION FORM MODAL — INSTITUTIONAL STANDARD
 * 
 * Mobile: Bottom sheet (Drawer) with sticky footer
 * Desktop: Centered modal (Dialog)
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
  
  const isMobile = useIsMobile();

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

  const formContent = (
    <div className="flex flex-col min-h-0 max-h-[90vh] md:max-h-none">
      {/* Header */}
      <div 
        className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 shrink-0"
        style={{ borderBottom: '1px solid var(--platform-border)' }}
      >
        <div className="min-w-0 flex-1">
          <h2 
            className="text-[17px] md:text-[16px] font-semibold leading-tight"
            style={{ color: 'var(--platform-text)' }}
          >
            {mode === "edit" ? "Edit organization" : "Add organization"}
          </h2>
          <p 
            className="text-[14px] md:text-[13px] mt-1.5 leading-normal"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {mode === "edit" 
              ? "Update organization details." 
              : "Create a new organization."}
          </p>
        </div>
        
        {/* Close button - desktop only (drawer has its own close) */}
        {!isMobile && (
          <button
            onClick={() => onOpenChange(false)}
            className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 -mt-1 -mr-1 transition-colors"
            style={{ color: 'var(--platform-text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Form Fields - scrollable on mobile */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5">
        <div className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label 
              htmlFor="org-name" 
              className="text-[14px] font-medium"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Name
            </Label>
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
            {errors.name && (
              <p className="text-[13px] text-red-400 mt-1.5">
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label 
              htmlFor="org-slug" 
              className="text-[14px] font-medium"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Slug
            </Label>
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
            {errors.slug ? (
              <p className="text-[13px] text-red-400 mt-1.5">
                {errors.slug}
              </p>
            ) : (
              <p 
                className="text-[13px] mt-1.5 leading-relaxed"
                style={{ color: 'var(--platform-text-muted)', opacity: 0.85 }}
              >
                URL-friendly identifier. Must be unique.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer - sticky on mobile */}
      <div 
        className="shrink-0 px-5 pt-4 pb-5 md:pb-5 space-y-3"
        style={{ 
          borderTop: '1px solid var(--platform-border)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        }}
      >
        {/* Primary: Create/Update */}
        <button 
          onClick={handleSubmit} 
          disabled={!isValid || saving}
          className="w-full h-12 md:h-11 rounded-lg text-[15px] md:text-[14px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: isValid ? 'var(--platform-text)' : 'rgba(255,255,255,0.1)',
            color: isValid ? 'var(--platform-canvas)' : 'var(--platform-text-muted)',
          }}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "edit" ? "Updating…" : "Creating…"}
            </>
          ) : (
            mode === "edit" ? "Update" : "Create"
          )}
        </button>

        {/* Secondary: Cancel */}
        <button
          onClick={() => onOpenChange(false)}
          disabled={saving}
          className="w-full h-10 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-40"
          style={{ color: 'var(--platform-text-secondary)' }}
          onMouseEnter={(e) => !saving && (e.currentTarget.style.color = 'var(--platform-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--platform-text-secondary)')}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Mobile: Bottom sheet (Drawer)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent 
          className="max-h-[90vh]"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
            borderBottom: 'none',
          }}
        >
          <DrawerClose 
            className="absolute top-4 right-4 h-11 w-11 rounded-lg flex items-center justify-center z-10"
            style={{ color: 'var(--platform-text-muted)' }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DrawerClose>
          {formContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Centered modal (Dialog)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[420px] p-0 gap-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
          borderRadius: '12px',
        }}
        // Hide default close button
        onPointerDownOutside={(e) => {
          if (saving) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (saving) e.preventDefault();
        }}
      >
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
