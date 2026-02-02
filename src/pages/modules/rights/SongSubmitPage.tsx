import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Check, HelpCircle, Upload, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { AppButton } from "@/components/app-ui";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * SONG SUBMIT PAGE — INSTITUTIONAL MULTI-STEP WIZARD
 * 
 * Design tokens from tribes-theme.css
 * Motion timing: 280ms ease-in-out (institutional standard)
 * Spacing: 8px base unit scale
 */

interface Writer {
  id: string;
  name: string;
  isFromDatabase: boolean;
  pro: string;
  split: string;
  credit: "lyrics" | "music" | "both";
  hasControl: boolean;
}

interface LyricSection {
  id: string;
  type: "verse" | "chorus" | "bridge" | "pre-chorus" | "outro" | "intro" | "other";
  content: string;
}

interface SongFormData {
  title: string;
  hasAlternateTitle: boolean;
  alternateTitle: string;
  language: string;
  songType: "original" | "instrumental" | "public_domain" | "derivative" | "medley";
  originalWorkTitle: string;
  hasBeenReleased: "yes" | "no" | "youtube_only";
  publicationYear: string;
  creationYear: string;
  writers: Writer[];
  lyricsEntryMode: "full" | "sections";
  fullLyrics: string;
  lyricSections: LyricSection[];
  lyricsConfirmed: boolean;
  hasChordChart: boolean;
  chordChartFile: File | null;
  chordChartAcknowledged: boolean;
  copyrightStatus: "yes" | "no" | "unknown";
  wantsCopyrightFiling: boolean;
  termsAccepted: boolean;
}

const createEmptyWriter = (): Writer => ({
  id: crypto.randomUUID(), name: "", isFromDatabase: false, pro: "", split: "", credit: "both", hasControl: false
});

const createEmptyLyricSection = (): LyricSection => ({
  id: crypto.randomUUID(), type: "verse", content: ""
});

const initialFormData: SongFormData = {
  title: "", hasAlternateTitle: false, alternateTitle: "", language: "English", songType: "original",
  originalWorkTitle: "", hasBeenReleased: "no", publicationYear: "", creationYear: "",
  writers: [createEmptyWriter()], lyricsEntryMode: "full", fullLyrics: "", lyricSections: [],
  lyricsConfirmed: false, hasChordChart: false, chordChartFile: null, chordChartAcknowledged: false,
  copyrightStatus: "unknown", wantsCopyrightFiling: false, termsAccepted: false,
};

const STEPS = [
  { number: 1, title: "Song Details", description: "Basic song information" },
  { number: 2, title: "Lyrics", description: "Add song lyrics" },
  { number: 3, title: "Chords", description: "Upload chord chart" },
  { number: 4, title: "Copyright", description: "Copyright status" },
  { number: 5, title: "Review & Submit", description: "Confirm and submit" },
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Chinese (Mandarin)", "Arabic", "Hebrew", "Russian", "Hindi", "Other"];
const SONG_TYPES = [
  { value: "original", label: "Original" },
  { value: "instrumental", label: "Instrumental" },
  { value: "public_domain", label: "Public Domain + Original Adaptation" },
  { value: "derivative", label: "Derivative Work" },
  { value: "medley", label: "Medley/Mashup" },
];
const PRO_OPTIONS = ["ASCAP", "BMI", "SESAC", "GMR", "SOCAN", "PRS", "GEMA", "SACEM", "JASRAC", "Other", "None"];
const LYRIC_SECTION_TYPES = [
  { value: "intro", label: "Intro" }, { value: "verse", label: "Verse" }, { value: "pre-chorus", label: "Pre-Chorus" },
  { value: "chorus", label: "Chorus" }, { value: "bridge", label: "Bridge" }, { value: "outro", label: "Outro" }, { value: "other", label: "Other" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1899 }, (_, i) => String(currentYear - i));

// Institutional input styles using design tokens
const inputBase = "w-full h-11 px-3.5 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[var(--app-radius-sm)] placeholder:text-[var(--btn-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 focus:border-[var(--app-focus)]/40 transition-all duration-[280ms] ease-in-out";
const selectBase = cn(inputBase, "appearance-none cursor-pointer pr-10");
const textareaBase = "w-full px-3.5 py-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[var(--app-radius-sm)] placeholder:text-[var(--btn-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 focus:border-[var(--app-focus)]/40 transition-all duration-[280ms] ease-in-out resize-y";

export default function SongSubmitPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SongFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const updateField = <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => setFormData(prev => ({ ...prev, [field]: value }));

  const addWriter = () => setFormData(prev => ({ ...prev, writers: [...prev.writers, createEmptyWriter()] }));
  const removeWriter = (id: string) => { if (formData.writers.length > 1) setFormData(prev => ({ ...prev, writers: prev.writers.filter(w => w.id !== id) })); };
  const updateWriter = (id: string, updates: Partial<Writer>) => setFormData(prev => ({ ...prev, writers: prev.writers.map(w => w.id === id ? { ...w, ...updates } : w) }));

  const addLyricSection = () => setFormData(prev => ({ ...prev, lyricSections: [...prev.lyricSections, createEmptyLyricSection()] }));
  const removeLyricSection = (id: string) => setFormData(prev => ({ ...prev, lyricSections: prev.lyricSections.filter(s => s.id !== id) }));
  const updateLyricSection = (id: string, updates: Partial<LyricSection>) => setFormData(prev => ({ ...prev, lyricSections: prev.lyricSections.map(s => s.id === id ? { ...s, ...updates } : s) }));

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) { toast.error("Song title is required"); return false; }
        if (formData.hasAlternateTitle && !formData.alternateTitle.trim()) { toast.error("Please enter the alternate title"); return false; }
        if (["public_domain", "derivative", "medley"].includes(formData.songType) && !formData.originalWorkTitle.trim()) { toast.error("Please enter the original work title"); return false; }
        if (formData.hasBeenReleased !== "no" && !formData.publicationYear) { toast.error("Please select the publication year"); return false; }
        if (formData.hasBeenReleased === "no" && !formData.creationYear) { toast.error("Please select the creation year"); return false; }
        for (const writer of formData.writers) {
          if (!writer.name.trim()) { toast.error("All writers must have a name"); return false; }
          if (!writer.split || parseFloat(writer.split) <= 0) { toast.error("All writers must have a valid split percentage"); return false; }
        }
        const totalSplit = formData.writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0);
        if (Math.abs(totalSplit - 100) > 0.01) { toast.error(`Writer splits must total 100% (currently ${totalSplit.toFixed(2)}%)`); return false; }
        return true;
      case 2:
        if (formData.lyricsEntryMode === "full" && !formData.fullLyrics.trim()) { toast.error("Please enter the song lyrics"); return false; }
        if (formData.lyricsEntryMode === "sections" && formData.lyricSections.length === 0) { toast.error("Please add at least one lyric section"); return false; }
        if (!formData.lyricsConfirmed) { toast.error("Please confirm the accuracy of the lyrics"); return false; }
        return true;
      case 3:
        if (!formData.hasChordChart && !formData.chordChartAcknowledged) { toast.error("Please acknowledge that you are not providing a chord chart"); return false; }
        return true;
      case 4: return true;
      case 5:
        if (!formData.termsAccepted) { toast.error("Please accept the Terms & Conditions"); return false; }
        return true;
      default: return true;
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setMobileNavOpen(false);
    } else if (step === currentStep + 1) {
      if (validateStep(currentStep)) {
        setCurrentStep(step);
        setMobileNavOpen(false);
      }
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      let lyrics = formData.fullLyrics;
      if (formData.lyricsEntryMode === "sections") {
        lyrics = formData.lyricSections.map(s => `[${s.type.toUpperCase()}]\n${s.content}`).join("\n\n");
      }
      const { error: songError } = await supabase.from("songs").insert({
        title: formData.title.trim(),
        alternate_titles: formData.hasAlternateTitle ? [formData.alternateTitle.trim()] : null,
        language: formData.language,
        genre: formData.songType,
        release_date: formData.hasBeenReleased !== "no" && formData.publicationYear ? `${formData.publicationYear}-01-01` : null,
        metadata: {
          song_type: formData.songType, original_work_title: formData.originalWorkTitle || null,
          has_been_released: formData.hasBeenReleased, creation_year: formData.creationYear || null,
          publication_year: formData.publicationYear || null, lyrics, lyrics_confirmed: formData.lyricsConfirmed,
          has_chord_chart: formData.hasChordChart, copyright_status: formData.copyrightStatus,
          wants_copyright_filing: formData.wantsCopyrightFiling,
          writers: formData.writers.map(w => ({ name: w.name, pro: w.pro, split: parseFloat(w.split), credit: w.credit, has_control: w.hasControl, is_from_database: w.isFromDatabase })),
        },
        is_active: false,
      });
      if (songError) throw songError;
      toast.success("Song submitted for review");
      navigate("/rights/catalogue");
    } catch (error: any) {
      console.error("Error submitting song:", error);
      toast.error(error.message || "Failed to submit song");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number) => step < currentStep;
  const isStepCurrent = (step: number) => step === currentStep;
  const isStepAccessible = (step: number) => step <= currentStep;

  return (
    <div className="h-full flex flex-col bg-[var(--page-bg)]">
      {/* Header */}
      <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center px-4 sm:px-6">
        <button 
          onClick={() => navigate("/rights/catalogue")} 
          className="p-2 -ml-2 rounded-[var(--app-radius-sm)] hover:bg-[var(--muted-wash)] transition-all duration-[280ms] ease-in-out text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="ml-3">
          <h1 className="text-lg font-semibold text-[var(--btn-text)] tracking-[-0.01em]">Submit Song</h1>
          <p className="text-[13px] text-[var(--btn-text-muted)]">Add a new song to your catalogue</p>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop: Vertical Step Navigation */}
        {!isMobile && (
          <aside className="w-60 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--sidebar-bg)] overflow-y-auto">
            <div className="p-4">
              <div className="text-[11px] font-medium text-[var(--btn-text-muted)] uppercase tracking-[0.05em] mb-4 px-3">
                Progress
              </div>
              <nav className="space-y-1">
                {STEPS.map((step) => (
                  <button
                    key={step.number}
                    onClick={() => goToStep(step.number)}
                    disabled={!isStepAccessible(step.number)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-[var(--app-radius-sm)] transition-all duration-[280ms] ease-in-out flex items-start gap-3",
                      isStepCurrent(step.number) && "bg-[var(--card-bg)] shadow-sm",
                      !isStepCurrent(step.number) && isStepAccessible(step.number) && "hover:bg-[var(--tribes-nav-hover)] cursor-pointer",
                      !isStepAccessible(step.number) && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5 transition-all duration-[280ms] ease-in-out",
                      isStepComplete(step.number) && "bg-[var(--btn-text)] text-white",
                      isStepCurrent(step.number) && !isStepComplete(step.number) && "bg-[var(--btn-text)] text-white",
                      !isStepComplete(step.number) && !isStepCurrent(step.number) && "border border-[var(--border-strong)] text-[var(--btn-text-muted)] bg-transparent"
                    )}>
                      {isStepComplete(step.number) ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "text-[13px] font-medium leading-tight",
                        isStepCurrent(step.number) ? "text-[var(--btn-text)]" : "text-[var(--btn-text-muted)]"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-[11px] text-[var(--btn-text-muted)] mt-0.5 leading-tight">
                        {step.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Mobile: Collapsible Step Header */}
        {isMobile && (
          <div className="absolute left-0 right-0 z-20 top-14">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="w-full px-4 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--border-subtle)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--btn-text)] text-white flex items-center justify-center text-[11px] font-semibold">
                  {currentStep}
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-medium text-[var(--btn-text)]">{STEPS[currentStep - 1].title}</div>
                  <div className="text-[11px] text-[var(--btn-text-muted)]">Step {currentStep} of {STEPS.length}</div>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-[var(--btn-text-muted)] transition-transform duration-[280ms] ease-in-out", mobileNavOpen && "rotate-180")} />
            </button>
            
            {mobileNavOpen && (
              <div className="bg-[var(--card-bg)] border-b border-[var(--border-subtle)] shadow-lg">
                {STEPS.map((step) => (
                  <button
                    key={step.number}
                    onClick={() => goToStep(step.number)}
                    disabled={!isStepAccessible(step.number)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 border-b border-[var(--border-subtle)]/50 last:border-0 transition-colors duration-[280ms] ease-in-out",
                      isStepCurrent(step.number) && "bg-[var(--muted-wash)]",
                      !isStepAccessible(step.number) && "opacity-40"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold",
                      (isStepComplete(step.number) || isStepCurrent(step.number)) && "bg-[var(--btn-text)] text-white",
                      !isStepComplete(step.number) && !isStepCurrent(step.number) && "border border-[var(--border-strong)] text-[var(--btn-text-muted)]"
                    )}>
                      {isStepComplete(step.number) ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step.number}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-[13px] font-medium text-[var(--btn-text)]">{step.title}</div>
                      <div className="text-[11px] text-[var(--btn-text-muted)]">{step.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Content */}
        <main className={cn("flex-1 overflow-y-auto", isMobile && "pt-[52px]")}>
          <div className="p-4 sm:p-6 max-w-2xl">
            {/* Step Title */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[var(--btn-text)] tracking-[-0.01em]">{STEPS[currentStep - 1].title}</h2>
              <p className="text-[13px] text-[var(--btn-text-muted)] mt-0.5">{STEPS[currentStep - 1].description}</p>
            </div>

            {/* Form Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[var(--app-radius)] p-5 sm:p-6 shadow-sm">
              {currentStep === 1 && <Step1SongDetails formData={formData} updateField={updateField} writers={formData.writers} addWriter={addWriter} removeWriter={removeWriter} updateWriter={updateWriter} />}
              {currentStep === 2 && <Step2Lyrics formData={formData} updateField={updateField} lyricSections={formData.lyricSections} addLyricSection={addLyricSection} removeLyricSection={removeLyricSection} updateLyricSection={updateLyricSection} />}
              {currentStep === 3 && <Step3Chords formData={formData} updateField={updateField} />}
              {currentStep === 4 && <Step4Copyright formData={formData} updateField={updateField} />}
              {currentStep === 5 && <Step5Agreement formData={formData} updateField={updateField} />}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  "px-4 py-2.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] border border-[var(--border-subtle)] transition-all duration-[280ms] ease-in-out",
                  currentStep === 1 
                    ? "opacity-40 cursor-not-allowed text-[var(--btn-text-muted)]" 
                    : "text-[var(--btn-text)] hover:bg-[var(--muted-wash)]"
                )}
              >
                Back
              </button>
              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] bg-[var(--btn-text)] text-white hover:opacity-90 transition-all duration-[280ms] ease-in-out"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] bg-[var(--btn-text)] text-white hover:opacity-90 transition-all duration-[280ms] ease-in-out flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Song"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// FORM SECTION COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

function FormSection({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--btn-text)]">{title}</h3>
        {description && <p className="text-[13px] text-[var(--btn-text-muted)] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 1: SONG DETAILS
// ════════════════════════════════════════════════════════════════════════════════

function Step1SongDetails({ formData, updateField, writers, addWriter, removeWriter, updateWriter }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; writers: Writer[]; addWriter: () => void; removeWriter: (id: string) => void; updateWriter: (id: string, updates: Partial<Writer>) => void; }) {
  return (
    <div className="space-y-6">
      <FormSection title="Basic Information" description="Enter the primary details for this song">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[var(--btn-text-muted)]">Title <span className="text-red-500">*</span></Label>
            <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Enter song title" className={inputBase} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="hasAlternateTitle" checked={formData.hasAlternateTitle} onCheckedChange={(checked) => updateField("hasAlternateTitle", !!checked)} />
              <Label htmlFor="hasAlternateTitle" className="text-sm cursor-pointer text-[var(--btn-text)]">This song has an alternate title</Label>
            </div>
            {formData.hasAlternateTitle && (
              <input type="text" value={formData.alternateTitle} onChange={(e) => updateField("alternateTitle", e.target.value)} placeholder="Enter alternate title" className={inputBase} />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[var(--btn-text-muted)]">Language</Label>
              <select value={formData.language} onChange={(e) => updateField("language", e.target.value)} className={selectBase}>
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[var(--btn-text-muted)]">Song Type</Label>
              <select value={formData.songType} onChange={(e) => updateField("songType", e.target.value as SongFormData["songType"])} className={selectBase}>
                {SONG_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
          </div>

          {["public_domain", "derivative", "medley"].includes(formData.songType) && (
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[var(--btn-text-muted)]">
                {formData.songType === "public_domain" && "Original Public Domain Title"}
                {formData.songType === "derivative" && "Original Composition Title"}
                {formData.songType === "medley" && "Other Copyright Title"}
                <span className="text-red-500"> *</span>
              </Label>
              <input type="text" value={formData.originalWorkTitle} onChange={(e) => updateField("originalWorkTitle", e.target.value)} placeholder="Enter title" className={inputBase} />
            </div>
          )}
        </div>
      </FormSection>

      <hr className="border-[var(--border-subtle)]" />

      <FormSection title="Release Information" description="Publication and release details">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-[var(--btn-text-muted)]">Has this song been recorded and released?</Label>
            <div className="flex flex-wrap gap-3">
              {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "youtube_only", label: "YouTube Only" }].map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-[280ms] ease-in-out",
                    formData.hasBeenReleased === option.value ? "border-[var(--btn-text)]" : "border-[var(--border-strong)] group-hover:border-[var(--btn-text-muted)]"
                  )}>
                    {formData.hasBeenReleased === option.value && <div className="w-2 h-2 rounded-full bg-[var(--btn-text)]" />}
                  </div>
                  <input type="radio" name="hasBeenReleased" value={option.value} checked={formData.hasBeenReleased === option.value} onChange={(e) => updateField("hasBeenReleased", e.target.value as SongFormData["hasBeenReleased"])} className="sr-only" />
                  <span className="text-sm text-[var(--btn-text)]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[var(--btn-text-muted)]">
              {formData.hasBeenReleased !== "no" ? "First Publication Year" : "Song Creation Year"} <span className="text-red-500">*</span>
            </Label>
            <select value={formData.hasBeenReleased !== "no" ? formData.publicationYear : formData.creationYear} onChange={(e) => updateField(formData.hasBeenReleased !== "no" ? "publicationYear" : "creationYear", e.target.value)} className={cn(selectBase, "max-w-[180px]")}>
              <option value="">Select year</option>
              {YEAR_OPTIONS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </FormSection>

      <hr className="border-[var(--border-subtle)]" />

      <FormSection title="Writers & Splits" description="Add all songwriters and their ownership splits">
        <div className="space-y-3">
          {writers.map((writer, index) => (
            <div key={writer.id} className="p-4 bg-[var(--muted-wash)] rounded-[var(--app-radius-sm)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--btn-text-muted)] uppercase tracking-[0.03em]">Writer {index + 1}</span>
                {writers.length > 1 && (
                  <button onClick={() => removeWriter(writer.id)} className="p-1 rounded hover:bg-red-50 text-[var(--btn-text-muted)] hover:text-red-600 transition-colors duration-[280ms] ease-in-out">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-[var(--btn-text-muted)]">Name <span className="text-red-500">*</span></Label>
                  <input type="text" value={writer.name} onChange={(e) => updateWriter(writer.id, { name: e.target.value })} placeholder="Writer name" className={cn(inputBase, "h-10 text-[13px]")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-[var(--btn-text-muted)]">PRO</Label>
                  <select value={writer.pro} onChange={(e) => updateWriter(writer.id, { pro: e.target.value })} className={cn(selectBase, "h-10 text-[13px]")}>
                    <option value="">Select PRO</option>
                    {PRO_OPTIONS.map(pro => <option key={pro} value={pro}>{pro}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-[var(--btn-text-muted)]">Split % <span className="text-red-500">*</span></Label>
                  <input type="number" min="0" max="100" step="0.01" value={writer.split} onChange={(e) => updateWriter(writer.id, { split: e.target.value })} placeholder="50.00" className={cn(inputBase, "h-10 text-[13px]")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-[var(--btn-text-muted)]">Credit</Label>
                  <select value={writer.credit} onChange={(e) => updateWriter(writer.id, { credit: e.target.value as Writer["credit"] })} className={cn(selectBase, "h-10 text-[13px]")}>
                    <option value="both">Lyrics & Music</option>
                    <option value="lyrics">Lyrics Only</option>
                    <option value="music">Music Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id={`control-${writer.id}`} checked={writer.hasControl} onCheckedChange={(checked) => updateWriter(writer.id, { hasControl: !!checked})} />
                <Label htmlFor={`control-${writer.id}`} className="text-sm flex items-center gap-1 cursor-pointer text-[var(--btn-text)]">
                  You control the rights for this songwriter
                  <TooltipProvider><Tooltip><TooltipTrigger><HelpCircle className="h-3.5 w-3.5 text-[var(--btn-text-muted)]" /></TooltipTrigger><TooltipContent side="top"><p className="text-[13px] max-w-[200px]">Do you control the publishing rights for this songwriter?</p></TooltipContent></Tooltip></TooltipProvider>
                </Label>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button onClick={addWriter} className="text-[13px] font-medium text-[var(--btn-text)] hover:text-[var(--btn-text-muted)] flex items-center gap-1 transition-colors duration-[280ms] ease-in-out">
              <Plus className="h-4 w-4" /> Add Writer
            </button>
            <span className={cn("text-[13px] font-medium tabular-nums", Math.abs(writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0) - 100) < 0.01 ? "text-green-600" : "text-red-600")}>
              Total: {writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0).toFixed(2)}%
            </span>
          </div>
          
          <p className="text-[11px] text-[var(--btn-text-muted)] leading-relaxed">
            Note: You can only register the portion of the song you control. The remaining portion will remain unaffiliated until claimed by other owner(s).
          </p>
        </div>
      </FormSection>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 2: LYRICS
// ════════════════════════════════════════════════════════════════════════════════

function Step2Lyrics({ formData, updateField, lyricSections, addLyricSection, removeLyricSection, updateLyricSection }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; lyricSections: LyricSection[]; addLyricSection: () => void; removeLyricSection: (id: string) => void; updateLyricSection: (id: string, updates: Partial<LyricSection>) => void; }) {
  return (
    <div className="space-y-6">
      <FormSection title="Entry Method">
        <div className="flex gap-2">
          {[{ value: "full", label: "Paste all at once" }, { value: "sections", label: "Add by section" }].map(option => (
            <button key={option.value} onClick={() => updateField("lyricsEntryMode", option.value as "full" | "sections")}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] border transition-all duration-[280ms] ease-in-out",
                formData.lyricsEntryMode === option.value 
                  ? "bg-[var(--btn-text)] text-white border-[var(--btn-text)]" 
                  : "bg-transparent text-[var(--btn-text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
              )}>
              {option.label}
            </button>
          ))}
        </div>
      </FormSection>

      {formData.lyricsEntryMode === "full" ? (
        <FormSection title="Lyrics">
          <textarea value={formData.fullLyrics} onChange={(e) => updateField("fullLyrics", e.target.value)} placeholder="Paste or type your lyrics here..." rows={12} className={cn(textareaBase, "min-h-[240px]")} />
        </FormSection>
      ) : (
        <FormSection title="Lyric Sections">
          <div className="space-y-3">
            {lyricSections.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--app-radius)]">
                <p className="text-[13px] text-[var(--btn-text-muted)] mb-2">No sections added yet</p>
                <button onClick={addLyricSection} className="text-[13px] font-medium text-[var(--btn-text)] hover:text-[var(--btn-text-muted)] flex items-center gap-1 mx-auto transition-colors duration-[280ms] ease-in-out">
                  <Plus className="h-4 w-4" /> Add First Section
                </button>
              </div>
            ) : (
              <>
                {lyricSections.map(section => (
                  <div key={section.id} className="p-4 bg-[var(--muted-wash)] rounded-[var(--app-radius-sm)] space-y-3">
                    <div className="flex items-center justify-between">
                      <select value={section.type} onChange={(e) => updateLyricSection(section.id, { type: e.target.value as LyricSection["type"] })} className={cn(selectBase, "h-9 w-32 text-[13px]")}>
                        {LYRIC_SECTION_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                      <button onClick={() => removeLyricSection(section.id)} className="p-1 rounded hover:bg-red-50 text-[var(--btn-text-muted)] hover:text-red-600 transition-colors duration-[280ms] ease-in-out">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <textarea value={section.content} onChange={(e) => updateLyricSection(section.id, { content: e.target.value })} placeholder={`Enter ${section.type} lyrics...`} rows={4} className={textareaBase} />
                  </div>
                ))}
                <button onClick={addLyricSection} className="text-[13px] font-medium text-[var(--btn-text)] hover:text-[var(--btn-text-muted)] flex items-center gap-1 transition-colors duration-[280ms] ease-in-out">
                  <Plus className="h-4 w-4" /> Add Section
                </button>
              </>
            )}
          </div>
        </FormSection>
      )}

      <hr className="border-[var(--border-subtle)]" />

      <div className="flex items-start gap-3">
        <Checkbox id="lyricsConfirmed" checked={formData.lyricsConfirmed} onCheckedChange={(checked) => updateField("lyricsConfirmed", !!checked)} className="mt-0.5" />
        <Label htmlFor="lyricsConfirmed" className="text-sm leading-relaxed cursor-pointer text-[var(--btn-text)]">
          I confirm the accuracy of the lyrics entered and that the lyrics are original and do not infringe on the rights of any other copyright holder. <span className="text-red-500">*</span>
        </Label>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 3: CHORDS
// ════════════════════════════════════════════════════════════════════════════════

function Step3Chords({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <FormSection title="Chord Chart Availability">
        <div className="flex gap-2">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(option => (
            <button key={String(option.value)} onClick={() => updateField("hasChordChart", option.value)}
              className={cn(
                "px-4 py-1.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] border transition-all duration-[280ms] ease-in-out",
                formData.hasChordChart === option.value 
                  ? "bg-[var(--btn-text)] text-white border-[var(--btn-text)]" 
                  : "bg-transparent text-[var(--btn-text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
              )}>
              {option.label}
            </button>
          ))}
        </div>
      </FormSection>

      {formData.hasChordChart ? (
        <FormSection title="Upload Chord Chart">
          <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--app-radius)] p-6 text-center hover:border-[var(--border-strong)] transition-colors duration-[280ms] ease-in-out">
            <Upload className="h-6 w-6 mx-auto mb-2 text-[var(--btn-text-muted)]" />
            <p className="text-[13px] text-[var(--btn-text-muted)] mb-3">Drag and drop or click to browse</p>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => { const file = e.target.files?.[0]; if (file) updateField("chordChartFile", file); }} className="hidden" id="chordChartUpload" />
            <button onClick={() => document.getElementById("chordChartUpload")?.click()} className="px-3 py-1.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] border border-[var(--border-subtle)] hover:bg-[var(--muted-wash)] transition-colors duration-[280ms] ease-in-out">
              Browse Files
            </button>
            {formData.chordChartFile && <p className="text-[13px] text-green-600 mt-3 font-medium">{formData.chordChartFile.name}</p>}
          </div>
        </FormSection>
      ) : (
        <div className="p-4 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-[var(--app-radius-sm)]">
          <div className="flex items-start gap-3">
            <Checkbox id="chordChartAcknowledged" checked={formData.chordChartAcknowledged} onCheckedChange={(checked) => updateField("chordChartAcknowledged", !!checked)} className="mt-0.5" />
            <Label htmlFor="chordChartAcknowledged" className="text-sm leading-relaxed cursor-pointer text-[var(--warning-text)]">
              I understand that chord charts are required to properly license and monetize songs at CCLI and that I am not supplying a chord chart at this time. <span className="text-red-500">*</span>
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 4: COPYRIGHT
// ════════════════════════════════════════════════════════════════════════════════

function Step4Copyright({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <FormSection title="Copyright Status" description="Has this song been filed for copyright protection?">
        <div className="flex flex-wrap gap-2">
          {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "I Don't Know" }].map(option => (
            <button key={option.value} onClick={() => updateField("copyrightStatus", option.value as SongFormData["copyrightStatus"])}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] border transition-all duration-[280ms] ease-in-out",
                formData.copyrightStatus === option.value 
                  ? "bg-[var(--btn-text)] text-white border-[var(--btn-text)]" 
                  : "bg-transparent text-[var(--btn-text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
              )}>
              {option.label}
            </button>
          ))}
        </div>
      </FormSection>

      {formData.copyrightStatus === "no" && (
        <FormSection title="Copyright Filing Service">
          <div className="p-4 bg-[var(--muted-wash)] rounded-[var(--app-radius-sm)] space-y-3">
            <p className="text-[13px] text-[var(--btn-text-muted)]">Would you like Tribes Rights Management to file this song for copyright protection on your behalf?</p>
            <div className="flex gap-2">
              {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(option => (
                <button key={String(option.value)} onClick={() => updateField("wantsCopyrightFiling", option.value)}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-medium rounded-[var(--app-radius-sm)] border transition-all duration-[280ms] ease-in-out",
                    formData.wantsCopyrightFiling === option.value 
                      ? "bg-[var(--btn-text)] text-white border-[var(--btn-text)]" 
                      : "bg-transparent text-[var(--btn-text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                  )}>
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--btn-text-muted)]">Cost and administration fees may apply. Please refer to your administration agreement.</p>
          </div>
        </FormSection>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP 5: AGREEMENT
// ════════════════════════════════════════════════════════════════════════════════

function Step5Agreement({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <FormSection title="Submission Summary">
        <div className="p-4 bg-[var(--muted-wash)] rounded-[var(--app-radius-sm)]">
          <dl className="space-y-2 text-sm">
            <div className="flex"><dt className="text-[var(--btn-text-muted)] w-28 shrink-0">Title</dt><dd className="font-medium text-[var(--btn-text)]">{formData.title || "—"}</dd></div>
            <div className="flex"><dt className="text-[var(--btn-text-muted)] w-28 shrink-0">Writers</dt><dd className="font-medium text-[var(--btn-text)]">{formData.writers.map(w => w.name).filter(Boolean).join(", ") || "—"}</dd></div>
            <div className="flex"><dt className="text-[var(--btn-text-muted)] w-28 shrink-0">Language</dt><dd className="font-medium text-[var(--btn-text)]">{formData.language}</dd></div>
            <div className="flex"><dt className="text-[var(--btn-text-muted)] w-28 shrink-0">Song Type</dt><dd className="font-medium text-[var(--btn-text)]">{SONG_TYPES.find(t => t.value === formData.songType)?.label}</dd></div>
            <div className="flex"><dt className="text-[var(--btn-text-muted)] w-28 shrink-0">Chord Chart</dt><dd className="font-medium text-[var(--btn-text)]">{formData.hasChordChart ? "Provided" : "Not provided"}</dd></div>
            <div className="flex"><dt className="text-[var(--btn-text-muted)] w-28 shrink-0">Copyright</dt><dd className="font-medium text-[var(--btn-text)]">{formData.copyrightStatus === "yes" ? "Filed" : formData.copyrightStatus === "no" ? "Not filed" : "Unknown"}</dd></div>
          </dl>
        </div>
      </FormSection>

      <hr className="border-[var(--border-subtle)]" />

      <FormSection title="Terms & Conditions">
        <div className="p-4 bg-[var(--muted-wash)] rounded-[var(--app-radius-sm)]">
          <p className="text-[13px] text-[var(--btn-text-muted)] mb-4 leading-relaxed">
            By submitting this song, you agree to the Tribes Rights Management LLC Terms & Conditions. Please review the complete terms at{" "}
            <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="text-[var(--btn-text)] underline hover:no-underline">tribesrightsmanagement.com</a>.
          </p>
          <div className="flex items-start gap-3">
            <Checkbox id="termsAccepted" checked={formData.termsAccepted} onCheckedChange={(checked) => updateField("termsAccepted", !!checked)} className="mt-0.5" />
            <Label htmlFor="termsAccepted" className="text-sm leading-relaxed cursor-pointer text-[var(--btn-text)]">
              I agree to the Tribes Rights Management LLC Terms & Conditions. <span className="text-red-500">*</span>
            </Label>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
