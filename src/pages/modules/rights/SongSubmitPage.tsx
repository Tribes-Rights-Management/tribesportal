import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, Plus, Check, HelpCircle, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppPageContainer, AppButton } from "@/components/app-ui";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * SONG SUBMIT PAGE — MULTI-STEP WIZARD
 * Institutional-grade song submission form following Tribes design standards
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
  { number: 1, title: "Song Details" },
  { number: 2, title: "Lyrics" },
  { number: 3, title: "Chords" },
  { number: 4, title: "Copyright" },
  { number: 5, title: "Agreement" },
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

// Shared input styles
const inputClass = "w-full h-10 px-3 text-[13px] bg-background border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground/30 transition-colors";
const selectClass = "w-full h-10 px-3 text-[13px] bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground/30 transition-colors appearance-none cursor-pointer";
const textareaClass = "w-full px-3 py-2.5 text-[13px] bg-background border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground/30 transition-colors resize-y";

export default function SongSubmitPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SongFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / STEPS.length) * 100;
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

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, STEPS.length)); };
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

  return (
    <div className="min-h-full pb-24">
      <AppPageContainer maxWidth="lg" className="pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/rights/catalogue")} className="p-2 -ml-2 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Submit Song</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Add a new song to your catalogue</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-muted-foreground font-medium">
              Step {currentStep} of {STEPS.length} · {STEPS[currentStep - 1].title}
            </span>
            <span className="text-[12px] font-semibold tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          
          {/* Step Pills */}
          <div className="flex items-center justify-between mt-5 px-1">
            {STEPS.map((step) => (
              <button
                key={step.number}
                onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                disabled={step.number > currentStep}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  step.number > currentStep && "opacity-40 cursor-not-allowed",
                  step.number < currentStep && "cursor-pointer hover:opacity-80"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all",
                  step.number === currentStep && "bg-foreground text-background",
                  step.number < currentStep && "bg-muted text-muted-foreground",
                  step.number > currentStep && "border border-border text-muted-foreground"
                )}>
                  {step.number < currentStep ? <Check className="h-3 w-3" /> : step.number}
                </span>
                <span className={cn(
                  "text-[11px] font-medium hidden sm:inline",
                  step.number === currentStep && "text-foreground",
                  step.number !== currentStep && "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
          {currentStep === 1 && <Step1SongDetails formData={formData} updateField={updateField} writers={formData.writers} addWriter={addWriter} removeWriter={removeWriter} updateWriter={updateWriter} />}
          {currentStep === 2 && <Step2Lyrics formData={formData} updateField={updateField} lyricSections={formData.lyricSections} addLyricSection={addLyricSection} removeLyricSection={removeLyricSection} updateLyricSection={updateLyricSection} />}
          {currentStep === 3 && <Step3Chords formData={formData} updateField={updateField} />}
          {currentStep === 4 && <Step4Copyright formData={formData} updateField={updateField} />}
          {currentStep === 5 && <Step5Agreement formData={formData} updateField={updateField} />}
        </div>
      </AppPageContainer>

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <AppButton intent="secondary" size="sm" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4" /> Back
          </AppButton>
          {currentStep < STEPS.length ? (
            <AppButton intent="primary" size="sm" onClick={handleNext}>
              Continue <ArrowRight className="h-4 w-4" />
            </AppButton>
          ) : (
            <AppButton intent="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit Song"}
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function Step1SongDetails({ formData, updateField, writers, addWriter, removeWriter, updateWriter }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; writers: Writer[]; addWriter: () => void; removeWriter: (id: string) => void; updateWriter: (id: string, updates: Partial<Writer>) => void; }) {
  return (
    <div className="space-y-8">
      {/* Basic Info Section */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Title <span className="text-destructive">*</span></Label>
          <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Enter song title" className={inputClass} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="hasAlternateTitle" checked={formData.hasAlternateTitle} onCheckedChange={(checked) => updateField("hasAlternateTitle", !!checked)} />
            <Label htmlFor="hasAlternateTitle" className="text-[13px] cursor-pointer">This song has an alternate title</Label>
          </div>
          {formData.hasAlternateTitle && (
            <input type="text" value={formData.alternateTitle} onChange={(e) => updateField("alternateTitle", e.target.value)} placeholder="Enter alternate title" className={inputClass} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Language</Label>
            <select value={formData.language} onChange={(e) => updateField("language", e.target.value)} className={selectClass}>
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Song Type</Label>
            <select value={formData.songType} onChange={(e) => updateField("songType", e.target.value as SongFormData["songType"])} className={selectClass}>
              {SONG_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
        </div>

        {["public_domain", "derivative", "medley"].includes(formData.songType) && (
          <div className="space-y-2">
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
              {formData.songType === "public_domain" && "Original Public Domain Title"}
              {formData.songType === "derivative" && "Original Composition Title"}
              {formData.songType === "medley" && "Other Copyright Title"}
              <span className="text-destructive"> *</span>
            </Label>
            <input type="text" value={formData.originalWorkTitle} onChange={(e) => updateField("originalWorkTitle", e.target.value)} placeholder="Enter title" className={inputClass} />
          </div>
        )}
      </div>

      {/* Release Section */}
      <div className="pt-6 border-t border-border space-y-5">
        <div className="space-y-3">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Has this song been recorded and released?</Label>
          <div className="flex flex-wrap gap-4">
            {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "youtube_only", label: "Yes - YouTube Only" }].map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors", formData.hasBeenReleased === option.value ? "border-foreground" : "border-muted-foreground/40 group-hover:border-muted-foreground")}>
                  {formData.hasBeenReleased === option.value && <div className="w-2 h-2 rounded-full bg-foreground" />}
                </div>
                <input type="radio" name="hasBeenReleased" value={option.value} checked={formData.hasBeenReleased === option.value} onChange={(e) => updateField("hasBeenReleased", e.target.value as SongFormData["hasBeenReleased"])} className="sr-only" />
                <span className="text-[13px]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            {formData.hasBeenReleased !== "no" ? "First Publication Year" : "Song Creation Year"} <span className="text-destructive">*</span>
          </Label>
          <select 
            value={formData.hasBeenReleased !== "no" ? formData.publicationYear : formData.creationYear} 
            onChange={(e) => updateField(formData.hasBeenReleased !== "no" ? "publicationYear" : "creationYear", e.target.value)} 
            className={selectClass}
          >
            <option value="">Select year</option>
            {YEAR_OPTIONS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {/* Writers Section */}
      <div className="pt-6 border-t border-border space-y-5">
        <div className="flex items-center justify-between">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Writers</Label>
          <button onClick={addWriter} className="text-[12px] font-medium text-foreground hover:text-foreground/70 flex items-center gap-1 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Writer
          </button>
        </div>

        <div className="space-y-4">
          {writers.map((writer, index) => (
            <div key={writer.id} className="p-4 bg-muted/30 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Writer {index + 1}</span>
                {writers.length > 1 && (
                  <button onClick={() => removeWriter(writer.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Name <span className="text-destructive">*</span></Label>
                  <input type="text" value={writer.name} onChange={(e) => updateWriter(writer.id, { name: e.target.value })} placeholder="Writer name" className={cn(inputClass, "h-9 text-[12px]")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">PRO</Label>
                  <select value={writer.pro} onChange={(e) => updateWriter(writer.id, { pro: e.target.value })} className={cn(selectClass, "h-9 text-[12px]")}>
                    <option value="">Select PRO</option>
                    {PRO_OPTIONS.map(pro => <option key={pro} value={pro}>{pro}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Split % <span className="text-destructive">*</span></Label>
                  <input type="number" min="0" max="100" step="0.01" value={writer.split} onChange={(e) => updateWriter(writer.id, { split: e.target.value })} placeholder="50.00" className={cn(inputClass, "h-9 text-[12px]")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Credit</Label>
                  <select value={writer.credit} onChange={(e) => updateWriter(writer.id, { credit: e.target.value as Writer["credit"] })} className={cn(selectClass, "h-9 text-[12px]")}>
                    <option value="both">Lyrics & Music</option>
                    <option value="lyrics">Lyrics Only</option>
                    <option value="music">Music Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id={`control-${writer.id}`} checked={writer.hasControl} onCheckedChange={(checked) => updateWriter(writer.id, { hasControl: !!checked })} />
                <Label htmlFor={`control-${writer.id}`} className="text-[12px] flex items-center gap-1 cursor-pointer">
                  You control the rights for this songwriter
                  <TooltipProvider><Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground" /></TooltipTrigger><TooltipContent side="top"><p className="text-[11px] max-w-[180px]">Do you control the publishing rights for this songwriter?</p></TooltipContent></Tooltip></TooltipProvider>
                </Label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <span className={cn("text-[12px] font-medium tabular-nums", Math.abs(writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0) - 100) < 0.01 ? "text-green-600 dark:text-green-500" : "text-destructive")}>
            Total: {writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0).toFixed(2)}%
            <span className="text-muted-foreground font-normal ml-1">(must equal 100%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Step2Lyrics({ formData, updateField, lyricSections, addLyricSection, removeLyricSection, updateLyricSection }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; lyricSections: LyricSection[]; addLyricSection: () => void; removeLyricSection: (id: string) => void; updateLyricSection: (id: string, updates: Partial<LyricSection>) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">How would you like to enter lyrics?</Label>
        <div className="flex gap-3">
          {[{ value: "full", label: "Paste all at once" }, { value: "sections", label: "Add by section" }].map(option => (
            <button key={option.value} onClick={() => updateField("lyricsEntryMode", option.value as "full" | "sections")}
              className={cn("px-4 py-2 text-[12px] font-medium rounded-md border transition-all", formData.lyricsEntryMode === option.value ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30")}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {formData.lyricsEntryMode === "full" ? (
        <div className="space-y-2">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Lyrics</Label>
          <textarea value={formData.fullLyrics} onChange={(e) => updateField("fullLyrics", e.target.value)} placeholder="Paste or type your lyrics here..." rows={14} className={cn(textareaClass, "min-h-[280px]")} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Lyric Sections</Label>
            <button onClick={addLyricSection} className="text-[12px] font-medium text-foreground hover:text-foreground/70 flex items-center gap-1 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Section
            </button>
          </div>
          {lyricSections.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
              <p className="text-[13px] text-muted-foreground">No sections added. Click "Add Section" to start.</p>
            </div>
          ) : (
            lyricSections.map(section => (
              <div key={section.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <select value={section.type} onChange={(e) => updateLyricSection(section.id, { type: e.target.value as LyricSection["type"] })} className={cn(selectClass, "h-8 w-32 text-[12px]")}>
                    {LYRIC_SECTION_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                  <button onClick={() => removeLyricSection(section.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea value={section.content} onChange={(e) => updateLyricSection(section.id, { content: e.target.value })} placeholder={`Enter ${section.type} lyrics...`} rows={4} className={textareaClass} />
              </div>
            ))
          )}
        </div>
      )}

      <div className="pt-6 border-t border-border">
        <div className="flex items-start gap-3">
          <Checkbox id="lyricsConfirmed" checked={formData.lyricsConfirmed} onCheckedChange={(checked) => updateField("lyricsConfirmed", !!checked)} className="mt-0.5" />
          <Label htmlFor="lyricsConfirmed" className="text-[13px] leading-relaxed cursor-pointer">
            I confirm the accuracy of the lyrics entered and that the lyrics are original and do not infringe on the rights of any other copyright holder. <span className="text-destructive">*</span>
          </Label>
        </div>
      </div>
    </div>
  );
}

function Step3Chords({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Is a chord chart available?</Label>
        <div className="flex gap-3">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(option => (
            <button key={String(option.value)} onClick={() => updateField("hasChordChart", option.value)}
              className={cn("px-6 py-2 text-[12px] font-medium rounded-md border transition-all", formData.hasChordChart === option.value ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30")}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {formData.hasChordChart ? (
        <div className="space-y-2">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Upload Chord Chart</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-foreground/30 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground mb-3">Drag and drop your file here, or click to browse</p>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => { const file = e.target.files?.[0]; if (file) updateField("chordChartFile", file); }} className="hidden" id="chordChartUpload" />
            <button onClick={() => document.getElementById("chordChartUpload")?.click()} className="px-4 py-2 text-[12px] font-medium rounded-md border border-border hover:bg-muted transition-colors">
              Browse Files
            </button>
            {formData.chordChartFile && <p className="text-[12px] text-green-600 dark:text-green-500 mt-3 font-medium">{formData.chordChartFile.name}</p>}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Checkbox id="chordChartAcknowledged" checked={formData.chordChartAcknowledged} onCheckedChange={(checked) => updateField("chordChartAcknowledged", !!checked)} className="mt-0.5" />
            <Label htmlFor="chordChartAcknowledged" className="text-[13px] leading-relaxed cursor-pointer text-amber-900 dark:text-amber-100">
              I understand that chord charts are required to properly license and monetize songs at CCLI and that I am not supplying a chord chart at this time. <span className="text-destructive">*</span>
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

function Step4Copyright({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Has this song been filed for copyright protection?</Label>
        <div className="flex flex-wrap gap-3">
          {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "I Don't Know" }].map(option => (
            <button key={option.value} onClick={() => updateField("copyrightStatus", option.value as SongFormData["copyrightStatus"])}
              className={cn("px-5 py-2 text-[12px] font-medium rounded-md border transition-all", formData.copyrightStatus === option.value ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30")}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {formData.copyrightStatus === "no" && (
        <div className="p-5 bg-muted/50 rounded-lg space-y-4">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Do you want us to file this song for copyright protection?</Label>
          <div className="flex gap-3">
            {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(option => (
              <button key={String(option.value)} onClick={() => updateField("wantsCopyrightFiling", option.value)}
                className={cn("px-5 py-2 text-[12px] font-medium rounded-md border transition-all", formData.wantsCopyrightFiling === option.value ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30")}>
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Cost and administration fees may apply. Please refer to your administration agreement.</p>
        </div>
      )}
    </div>
  );
}

function Step5Agreement({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-muted/30 rounded-lg">
        <h3 className="text-[13px] font-semibold mb-3">Terms & Conditions</h3>
        <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
          By submitting this song, you agree to the Tribes Rights Management LLC Terms & Conditions. Please review the complete terms at{" "}
          <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">tribesrightsmanagement.com</a>.
        </p>
        <div className="flex items-start gap-3">
          <Checkbox id="termsAccepted" checked={formData.termsAccepted} onCheckedChange={(checked) => updateField("termsAccepted", !!checked)} className="mt-0.5" />
          <Label htmlFor="termsAccepted" className="text-[13px] leading-relaxed cursor-pointer">
            I agree to the Tribes Rights Management LLC Terms & Conditions. <span className="text-destructive">*</span>
          </Label>
        </div>
      </div>

      <div className="p-5 border border-border rounded-lg">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Submission Summary</h3>
        <dl className="space-y-3 text-[13px]">
          <div className="flex"><dt className="text-muted-foreground w-28 shrink-0">Title</dt><dd className="font-medium">{formData.title || "—"}</dd></div>
          <div className="flex"><dt className="text-muted-foreground w-28 shrink-0">Writers</dt><dd className="font-medium">{formData.writers.map(w => w.name).filter(Boolean).join(", ") || "—"}</dd></div>
          <div className="flex"><dt className="text-muted-foreground w-28 shrink-0">Language</dt><dd className="font-medium">{formData.language}</dd></div>
          <div className="flex"><dt className="text-muted-foreground w-28 shrink-0">Song Type</dt><dd className="font-medium">{SONG_TYPES.find(t => t.value === formData.songType)?.label}</dd></div>
        </dl>
      </div>
    </div>
  );
}
