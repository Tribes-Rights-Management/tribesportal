import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, Plus, Check, HelpCircle, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AppPageContainer,
  AppSection,
  AppButton,
} from "@/components/app-ui";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

function createEmptyWriter(): Writer {
  return { id: crypto.randomUUID(), name: "", isFromDatabase: false, pro: "", split: "", credit: "both", hasControl: false };
}

function createEmptyLyricSection(): LyricSection {
  return { id: crypto.randomUUID(), type: "verse", content: "" };
}

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

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Chinese (Mandarin)", "Chinese (Cantonese)", "Arabic", "Hebrew", "Russian", "Hindi", "Swahili", "Other"];

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

export default function SongSubmitPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SongFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / STEPS.length) * 100;

  const updateField = <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    <AppPageContainer maxWidth="lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/rights/catalogue")} className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Submit Song</h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-muted-foreground">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</span>
          <span className="text-[13px] font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-3">
          {STEPS.map((step) => (
            <button key={step.number} onClick={() => step.number < currentStep && setCurrentStep(step.number)} disabled={step.number > currentStep}
              className={cn("flex items-center gap-1.5 text-[11px] transition-colors", step.number === currentStep && "text-foreground font-medium", step.number < currentStep && "text-muted-foreground hover:text-foreground cursor-pointer", step.number > currentStep && "text-muted-foreground/50 cursor-not-allowed")}>
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] border", step.number === currentStep && "border-foreground bg-foreground text-background", step.number < currentStep && "border-muted-foreground bg-muted", step.number > currentStep && "border-muted-foreground/50")}>
                {step.number < currentStep ? <Check className="h-3 w-3" /> : step.number}
              </span>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      <AppSection spacing="md" className="mb-6">
        {currentStep === 1 && <Step1SongDetails formData={formData} updateField={updateField} writers={formData.writers} addWriter={addWriter} removeWriter={removeWriter} updateWriter={updateWriter} />}
        {currentStep === 2 && <Step2Lyrics formData={formData} updateField={updateField} lyricSections={formData.lyricSections} addLyricSection={addLyricSection} removeLyricSection={removeLyricSection} updateLyricSection={updateLyricSection} />}
        {currentStep === 3 && <Step3Chords formData={formData} updateField={updateField} />}
        {currentStep === 4 && <Step4Copyright formData={formData} updateField={updateField} />}
        {currentStep === 5 && <Step5Agreement formData={formData} updateField={updateField} />}
      </AppSection>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <AppButton intent="secondary" size="sm" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4" /> Back
        </AppButton>
        {currentStep < STEPS.length ? (
          <AppButton intent="primary" size="sm" onClick={handleNext}>Next <ArrowRight className="h-4 w-4" /></AppButton>
        ) : (
          <AppButton intent="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit Song"}
          </AppButton>
        )}
      </div>
    </AppPageContainer>
  );
}

function Step1SongDetails({ formData, updateField, writers, addWriter, removeWriter, updateWriter }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; writers: Writer[]; addWriter: () => void; removeWriter: (id: string) => void; updateWriter: (id: string, updates: Partial<Writer>) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium">Title <span className="text-destructive">*</span></Label>
        <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Enter song title"
          className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring")} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="hasAlternateTitle" checked={formData.hasAlternateTitle} onCheckedChange={(checked) => updateField("hasAlternateTitle", !!checked)} />
          <Label htmlFor="hasAlternateTitle" className="text-[13px]">This song has an alternate title</Label>
        </div>
        {formData.hasAlternateTitle && (
          <input type="text" value={formData.alternateTitle} onChange={(e) => updateField("alternateTitle", e.target.value)} placeholder="Enter alternate title"
            className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring")} />
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium">Language</Label>
        <select value={formData.language} onChange={(e) => updateField("language", e.target.value)} className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
          {LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium">Song Type</Label>
        <select value={formData.songType} onChange={(e) => updateField("songType", e.target.value as SongFormData["songType"])} className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
          {SONG_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </div>

      {["public_domain", "derivative", "medley"].includes(formData.songType) && (
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium">
            {formData.songType === "public_domain" && "Enter the title of the original public domain song"}
            {formData.songType === "derivative" && "Enter the title of original composition"}
            {formData.songType === "medley" && "Enter the title of other copyright used in this medley/mashup"}
            <span className="text-destructive"> *</span>
          </Label>
          <input type="text" value={formData.originalWorkTitle} onChange={(e) => updateField("originalWorkTitle", e.target.value)} placeholder="Enter title"
            className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring")} />
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-[13px] font-medium">Has this song been recorded and released?</Label>
        <div className="flex flex-wrap gap-4">
          {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "youtube_only", label: "Yes - YouTube Only" }].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="hasBeenReleased" value={option.value} checked={formData.hasBeenReleased === option.value} onChange={(e) => updateField("hasBeenReleased", e.target.value as SongFormData["hasBeenReleased"])} className="w-4 h-4" />
              <span className="text-[13px]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.hasBeenReleased !== "no" ? (
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium">First Publication Year <span className="text-destructive">*</span></Label>
          <select value={formData.publicationYear} onChange={(e) => updateField("publicationYear", e.target.value)} className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
            <option value="">Select year</option>
            {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium">Song Creation Year <span className="text-destructive">*</span></Label>
          <select value={formData.creationYear} onChange={(e) => updateField("creationYear", e.target.value)} className={cn("w-full h-10 px-3 text-[14px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
            <option value="">Select year</option>
            {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-[13px] font-medium">Writers</Label>
          <AppButton intent="secondary" size="sm" onClick={addWriter}><Plus className="h-3.5 w-3.5" /> Add Writer</AppButton>
        </div>

        {writers.map((writer, index) => (
          <div key={writer.id} className="p-4 border border-border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted-foreground">Writer {index + 1}</span>
              {writers.length > 1 && <button onClick={() => removeWriter(writer.id)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Name <span className="text-destructive">*</span></Label>
                <input type="text" value={writer.name} onChange={(e) => updateWriter(writer.id, { name: e.target.value })} placeholder="Writer name" className={cn("w-full h-9 px-3 text-[13px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">PRO</Label>
                <select value={writer.pro} onChange={(e) => updateWriter(writer.id, { pro: e.target.value })} className={cn("w-full h-9 px-3 text-[13px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
                  <option value="">Select PRO</option>
                  {PRO_OPTIONS.map((pro) => <option key={pro} value={pro}>{pro}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Split % <span className="text-destructive">*</span></Label>
                <input type="number" min="0" max="100" step="0.01" value={writer.split} onChange={(e) => updateWriter(writer.id, { split: e.target.value })} placeholder="e.g., 50.00" className={cn("w-full h-9 px-3 text-[13px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Credit</Label>
                <select value={writer.credit} onChange={(e) => updateWriter(writer.id, { credit: e.target.value as Writer["credit"] })} className={cn("w-full h-9 px-3 text-[13px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
                  <option value="both">Lyrics & Music</option>
                  <option value="lyrics">Lyrics Only</option>
                  <option value="music">Music Only</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id={`control-${writer.id}`} checked={writer.hasControl} onCheckedChange={(checked) => updateWriter(writer.id, { hasControl: !!checked })} />
              <Label htmlFor={`control-${writer.id}`} className="text-[12px] flex items-center gap-1">
                You control the rights for this songwriter
                <TooltipProvider><Tooltip><TooltipTrigger><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent><p className="text-[12px] max-w-[200px]">Do you control the rights of this song for this songwriter?</p></TooltipContent></Tooltip></TooltipProvider>
              </Label>
            </div>
          </div>
        ))}

        <div className="text-[12px] text-right">
          <span className={cn("font-medium", Math.abs(writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0) - 100) < 0.01 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
            Total: {writers.reduce((sum, w) => sum + (parseFloat(w.split) || 0), 0).toFixed(2)}%
          </span>
          <span className="text-muted-foreground"> (must equal 100%)</span>
        </div>
      </div>
    </div>
  );
}

function Step2Lyrics({ formData, updateField, lyricSections, addLyricSection, removeLyricSection, updateLyricSection }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; lyricSections: LyricSection[]; addLyricSection: () => void; removeLyricSection: (id: string) => void; updateLyricSection: (id: string, updates: Partial<LyricSection>) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-[13px] font-medium">How would you like to enter lyrics?</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="lyricsEntryMode" value="full" checked={formData.lyricsEntryMode === "full"} onChange={() => updateField("lyricsEntryMode", "full")} className="w-4 h-4" />
            <span className="text-[13px]">Add all lyrics at once</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="lyricsEntryMode" value="sections" checked={formData.lyricsEntryMode === "sections"} onChange={() => updateField("lyricsEntryMode", "sections")} className="w-4 h-4" />
            <span className="text-[13px]">Add lyrics by section</span>
          </label>
        </div>
      </div>

      {formData.lyricsEntryMode === "full" && (
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium">Lyrics</Label>
          <textarea value={formData.fullLyrics} onChange={(e) => updateField("fullLyrics", e.target.value)} placeholder="Paste or type your lyrics here..." rows={12}
            className={cn("w-full px-3 py-2 text-[14px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-y min-h-[200px]")} />
        </div>
      )}

      {formData.lyricsEntryMode === "sections" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[13px] font-medium">Lyric Sections</Label>
            <AppButton intent="secondary" size="sm" onClick={addLyricSection}><Plus className="h-3.5 w-3.5" /> Add Section</AppButton>
          </div>
          {lyricSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-[13px]">No sections added yet. Click "Add Section" to start.</div>
          ) : (
            lyricSections.map((section) => (
              <div key={section.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <select value={section.type} onChange={(e) => updateLyricSection(section.id, { type: e.target.value as LyricSection["type"] })} className={cn("h-9 px-3 text-[13px] bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring")}>
                    {LYRIC_SECTION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                  <button onClick={() => removeLyricSection(section.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <textarea value={section.content} onChange={(e) => updateLyricSection(section.id, { content: e.target.value })} placeholder={`Enter ${section.type} lyrics...`} rows={4}
                  className={cn("w-full px-3 py-2 text-[14px] bg-transparent border border-border rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-y")} />
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex items-start gap-2 pt-4 border-t border-border">
        <Checkbox id="lyricsConfirmed" checked={formData.lyricsConfirmed} onCheckedChange={(checked) => updateField("lyricsConfirmed", !!checked)} />
        <Label htmlFor="lyricsConfirmed" className="text-[13px] leading-relaxed">
          I confirm the accuracy of the lyrics entered and that the lyrics are original and do not infringe on the rights of any other copyright holder. <span className="text-destructive">*</span>
        </Label>
      </div>
    </div>
  );
}

function Step3Chords({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-[13px] font-medium">Is a chord chart available?</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="hasChordChart" checked={formData.hasChordChart === true} onChange={() => updateField("hasChordChart", true)} className="w-4 h-4" />
            <span className="text-[13px]">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="hasChordChart" checked={formData.hasChordChart === false} onChange={() => updateField("hasChordChart", false)} className="w-4 h-4" />
            <span className="text-[13px]">No</span>
          </label>
        </div>
      </div>

      {formData.hasChordChart ? (
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium">Upload Chord Chart</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground mb-2">Drag and drop your chord chart here, or click to browse</p>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => { const file = e.target.files?.[0]; if (file) updateField("chordChartFile", file); }} className="hidden" id="chordChartUpload" />
            <AppButton intent="secondary" size="sm" onClick={() => document.getElementById("chordChartUpload")?.click()}>Browse Files</AppButton>
            {formData.chordChartFile && <p className="text-[12px] text-green-600 dark:text-green-400 mt-2">Selected: {formData.chordChartFile.name}</p>}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
          <Checkbox id="chordChartAcknowledged" checked={formData.chordChartAcknowledged} onCheckedChange={(checked) => updateField("chordChartAcknowledged", !!checked)} />
          <Label htmlFor="chordChartAcknowledged" className="text-[13px] leading-relaxed">
            I understand that chord charts are required to properly license and monetize songs at CCLI and that I am not supplying a chord chart at this time. <span className="text-destructive">*</span>
          </Label>
        </div>
      )}
    </div>
  );
}

function Step4Copyright({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-[13px] font-medium">Has this song been filed for copyright protection?</Label>
        <div className="flex flex-wrap gap-4">
          {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "I Don't Know" }].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="copyrightStatus" value={option.value} checked={formData.copyrightStatus === option.value} onChange={(e) => updateField("copyrightStatus", e.target.value as SongFormData["copyrightStatus"])} className="w-4 h-4" />
              <span className="text-[13px]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.copyrightStatus === "no" && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <Label className="text-[13px] font-medium">Do you want us to file this song for copyright protection for you?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="wantsCopyrightFiling" checked={formData.wantsCopyrightFiling === true} onChange={() => updateField("wantsCopyrightFiling", true)} className="w-4 h-4" />
              <span className="text-[13px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="wantsCopyrightFiling" checked={formData.wantsCopyrightFiling === false} onChange={() => updateField("wantsCopyrightFiling", false)} className="w-4 h-4" />
              <span className="text-[13px]">No</span>
            </label>
          </div>
          <p className="text-[12px] text-muted-foreground">Cost and administration fees may incur. Please refer to your administration agreement.</p>
        </div>
      )}
    </div>
  );
}

function Step5Agreement({ formData, updateField }: { formData: SongFormData; updateField: <K extends keyof SongFormData>(field: K, value: SongFormData[K]) => void; }) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-muted/30 rounded-lg">
        <h3 className="text-[14px] font-medium mb-4">Terms & Conditions</h3>
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
          By submitting this song, you agree to the Tribes Rights Management LLC Terms & Conditions. Please review the complete terms at{" "}
          <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">tribesrightsmanagement.com</a>.
        </p>
        <div className="flex items-start gap-2">
          <Checkbox id="termsAccepted" checked={formData.termsAccepted} onCheckedChange={(checked) => updateField("termsAccepted", !!checked)} />
          <Label htmlFor="termsAccepted" className="text-[13px] leading-relaxed">
            I agree to the Tribes Rights Management LLC Terms & Conditions as provided via{" "}
            <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">https://tribesrightsmanagement.com</a>. <span className="text-destructive">*</span>
          </Label>
        </div>
      </div>

      <div className="p-4 border border-border rounded-lg">
        <h3 className="text-[14px] font-medium mb-3">Submission Summary</h3>
        <dl className="space-y-2 text-[13px]">
          <div className="flex"><dt className="text-muted-foreground w-32">Title:</dt><dd className="font-medium">{formData.title || "—"}</dd></div>
          <div className="flex"><dt className="text-muted-foreground w-32">Writers:</dt><dd className="font-medium">{formData.writers.map(w => w.name).filter(Boolean).join(", ") || "—"}</dd></div>
          <div className="flex"><dt className="text-muted-foreground w-32">Language:</dt><dd className="font-medium">{formData.language}</dd></div>
          <div className="flex"><dt className="text-muted-foreground w-32">Song Type:</dt><dd className="font-medium">{SONG_TYPES.find(t => t.value === formData.songType)?.label}</dd></div>
        </dl>
      </div>
    </div>
  );
}
