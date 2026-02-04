import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Plus, Trash2, HelpCircle, Upload, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════════════════════
// ALGOLIA CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const ALGOLIA_APP_ID = "8WVEYVACJ3";
const ALGOLIA_SEARCH_KEY = "00c22202043b8d20f009257782838d48";
const ALGOLIA_INDEX = "writers";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Writer {
  id: string;
  name: string;
  pro: string;
  ipi: string;
  split: number;
  credit: "lyrics" | "music" | "both" | "";
  controlled: boolean;
  fromDatabase: boolean;
}

interface LyricSection {
  id: string;
  type: "verse" | "chorus" | "bridge" | "pre-chorus" | "outro" | "intro" | "tag" | "interlude" | "refrain" | "ending" | "spoken" | "vamp" | "rap" | "";
  content: string;
}

interface SongData {
  title: string;
  hasAlternateTitle: boolean | null;
  alternateTitle: string;
  language: string;
  songType: "original" | "instrumental" | "public_domain" | "derivative" | "medley" | "";
  originalWorkTitle: string;
  releaseStatus: "yes" | "no" | "youtube_only" | null;
  publicationYear: string;
  creationYear: string;
  writers: Writer[];
  lyricsEntryMode: "paste" | "sections";
  lyricsFull: string;
  lyricsSections: LyricSection[];
  lyricsConfirmed: boolean;
  hasChordChart: boolean | null;
  chordChartFile: File | null;
  chordChartAcknowledged: boolean;
  copyrightStatus: "yes" | "no" | "unknown" | "";
  wantsCopyrightFiling: boolean | null;
  termsAccepted: boolean;
}

type FlowStep = 1 | 2 | 3 | 4 | 5;

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian", 
  "Korean", "Japanese", "Chinese (Mandarin)", "Chinese (Cantonese)",
  "Arabic", "Hebrew", "Russian", "Hindi", "Swahili", "Dutch",
  "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Greek",
  "Turkish", "Vietnamese", "Thai", "Indonesian", "Tagalog", "Other"
];

const SONG_TYPES = [
  { value: "original", label: "Original" },
  { value: "instrumental", label: "Instrumental" },
  { value: "public_domain", label: "Public Domain + Original Adaptation" },
  { value: "derivative", label: "Derivative Work" },
  { value: "medley", label: "Medley/Mashup" },
];

const PRO_OPTIONS = ["ASCAP", "BMI", "SESAC", "GMR", "PRS", "APRA", "SOCAN", "GEMA", "SACEM", "Other"];

const LYRIC_SECTION_TYPES = [
  { value: "verse", label: "Verse" },
  { value: "chorus", label: "Chorus" },
  { value: "pre-chorus", label: "Pre-Chorus" },
  { value: "bridge", label: "Bridge" },
  { value: "intro", label: "Intro" },
  { value: "outro", label: "Outro" },
  { value: "tag", label: "Tag" },
  { value: "interlude", label: "Interlude" },
  { value: "refrain", label: "Refrain" },
  { value: "ending", label: "Ending" },
  { value: "spoken", label: "Spoken Words" },
  { value: "vamp", label: "Vamp" },
  { value: "rap", label: "Rap" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SongSubmitPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<FlowStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [writerSearchResults, setWriterSearchResults] = useState<Record<string, any[]>>({});
  const [activeWriterSearch, setActiveWriterSearch] = useState<string | null>(null);
  
  const [data, setData] = useState<SongData>({
    title: "",
    hasAlternateTitle: null,
    alternateTitle: "",
    language: "English",
    songType: "",
    originalWorkTitle: "",
    releaseStatus: null,
    publicationYear: "",
    creationYear: "",
    writers: [{ id: crypto.randomUUID(), name: "", pro: "", ipi: "", split: 0, credit: "", controlled: false, fromDatabase: false }],
    lyricsEntryMode: "paste",
    lyricsFull: "",
    lyricsSections: [],
    lyricsConfirmed: false,
    hasChordChart: null,
    chordChartFile: null,
    chordChartAcknowledged: false,
    copyrightStatus: "",
    wantsCopyrightFiling: null,
    termsAccepted: false,
  });

  // Writer management
  const addWriter = () => {
    setData(prev => ({
      ...prev,
      writers: [...prev.writers, { id: crypto.randomUUID(), name: "", pro: "", ipi: "", split: 0, credit: "", controlled: false, fromDatabase: false }]
    }));
  };

  const updateWriter = (id: string, updates: Partial<Writer>) => {
    setData(prev => ({
      ...prev,
      writers: prev.writers.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  };

  const removeWriter = (id: string) => {
    if (data.writers.length > 1) {
      setData(prev => ({ ...prev, writers: prev.writers.filter(w => w.id !== id) }));
    }
  };

  // Algolia writer search
  const searchWriters = async (query: string, writerId: string) => {
    if (!query.trim() || query.length < 2) {
      setWriterSearchResults(prev => ({ ...prev, [writerId]: [] }));
      return;
    }
    
    try {
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
        {
          method: "POST",
          headers: {
            "X-Algolia-API-Key": ALGOLIA_SEARCH_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, hitsPerPage: 8 }),
        }
      );
      const data = await response.json();
      setWriterSearchResults(prev => ({ ...prev, [writerId]: data.hits || [] }));
    } catch (error) {
      console.error("Writer search error:", error);
    }
  };

  const selectWriterFromDatabase = (writerId: string, hit: any) => {
    updateWriter(writerId, {
      name: hit.name,
      pro: hit.pro || "",
      ipi: hit.ipi_number || "",
      fromDatabase: true,
    });
    setWriterSearchResults(prev => ({ ...prev, [writerId]: [] }));
    setActiveWriterSearch(null);
  };

  // Lyric section management
  const addLyricSection = () => {
    setData(prev => ({
      ...prev,
      lyricsSections: [...prev.lyricsSections, { id: crypto.randomUUID(), type: "", content: "" }]
    }));
  };

  const updateLyricSection = (id: string, updates: Partial<LyricSection>) => {
    setData(prev => ({
      ...prev,
      lyricsSections: prev.lyricsSections.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeLyricSection = (id: string) => {
    setData(prev => ({ ...prev, lyricsSections: prev.lyricsSections.filter(s => s.id !== id) }));
  };

  // Validation
  const canAdvanceStep = (): boolean => {
    switch (step) {
      case 1:
        const hasTitle = !!data.title;
        const hasAltHandled = data.hasAlternateTitle === false || (data.hasAlternateTitle === true && !!data.alternateTitle);
        const hasType = !!data.songType;
        const hasOriginal = !["public_domain", "derivative", "medley"].includes(data.songType) || !!data.originalWorkTitle;
        const hasYear = data.releaseStatus === "no" ? !!data.creationYear : !!data.publicationYear;
        const totalSplit = data.writers.reduce((s, w) => s + w.split, 0);
        const hasWriters = data.writers.length > 0 && 
          data.writers.every(w => w.name && w.split > 0 && w.credit && w.pro) &&
          Math.abs(totalSplit - 100) < 0.01;
        return hasTitle && hasAltHandled && hasType && hasOriginal && data.releaseStatus !== null && hasYear && hasWriters;
      case 2:
        if (data.songType === "instrumental") return true;
        const hasLyrics = data.lyricsEntryMode === "paste" ? !!data.lyricsFull : data.lyricsSections.length > 0 && data.lyricsSections.every(s => s.type && s.content);
        return hasLyrics && data.lyricsConfirmed;
      case 3:
        return data.hasChordChart === true || data.chordChartAcknowledged;
      case 4:
        if (!data.copyrightStatus) return false;
        if (data.copyrightStatus === "no") return data.wantsCopyrightFiling !== null;
        return true;
      case 5:
        return data.termsAccepted;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (step < 5 && canAdvanceStep()) setStep((step + 1) as FlowStep);
  };

  const goToPrevStep = () => {
    if (step > 1) setStep((step - 1) as FlowStep);
    else navigate("/rights/catalogue");
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const year = data.releaseStatus === "no" ? data.creationYear : data.publicationYear;
      const lyrics = data.lyricsEntryMode === "paste" ? data.lyricsFull : data.lyricsSections.map(s => `[${s.type?.toUpperCase()}]\n${s.content}`).join("\n\n");
      
      const songPayload = {
        title: data.title,
        alternate_titles: data.hasAlternateTitle && data.alternateTitle ? [data.alternateTitle] : null,
        language: data.language,
        genre: data.songType || "original",
        release_date: data.releaseStatus !== "no" && year ? `${year}-01-01` : null,
        metadata: {
          song_type: data.songType,
          original_work_title: data.originalWorkTitle || null,
          release_status: data.releaseStatus,
          publication_year: data.publicationYear || null,
          creation_year: data.creationYear || null,
          lyrics,
          lyrics_sections: data.lyricsSections,
          lyrics_confirmed: data.lyricsConfirmed,
          has_chord_chart: data.hasChordChart,
          copyright_status: data.copyrightStatus,
          wants_copyright_filing: data.wantsCopyrightFiling,
          writers: data.writers.map(w => ({
            name: w.name, pro: w.pro, ipi: w.ipi, split: w.split, credit: w.credit, controlled: w.controlled,
          })),
        },
        is_active: false,
      };
      const { error } = await supabase.from("songs").insert(songPayload as any);
      
      if (error) throw error;
      toast.success("Song submitted successfully");
      navigate("/rights/catalogue");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSplit = data.writers.reduce((s, w) => s + w.split, 0);
  const splitValid = Math.abs(totalSplit - 100) < 0.01;

  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP DEFINITIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const STEPS = [
    { id: 1, label: "Song Info", description: "Title, writers, and details" },
    { id: 2, label: "Lyrics", description: "Song lyrics or instrumental" },
    { id: 3, label: "Chords", description: "Chord chart upload" },
    { id: 4, label: "Copyright", description: "Protection status" },
    { id: 5, label: "Agreement", description: "Terms and submit" },
  ];

  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        const hasTitle = !!data.title;
        const hasAltHandled = data.hasAlternateTitle === false || (data.hasAlternateTitle === true && !!data.alternateTitle);
        const hasType = !!data.songType;
        const hasOriginal = !["public_domain", "derivative", "medley"].includes(data.songType) || !!data.originalWorkTitle;
        const hasYear = data.releaseStatus === "no" ? !!data.creationYear : !!data.publicationYear;
        const hasWriters = data.writers.length > 0 && 
          data.writers.every(w => w.name && w.split > 0 && w.credit && w.pro) &&
          Math.abs(data.writers.reduce((s, w) => s + w.split, 0) - 100) < 0.01;
        return hasTitle && hasAltHandled && hasType && hasOriginal && data.releaseStatus !== null && hasYear && hasWriters;
      case 2:
        if (data.songType === "instrumental") return true;
        const hasLyrics = data.lyricsEntryMode === "paste" ? !!data.lyricsFull : data.lyricsSections.length > 0 && data.lyricsSections.every(s => s.type && s.content);
        return hasLyrics && data.lyricsConfirmed;
      case 3:
        return data.hasChordChart === true || data.chordChartAcknowledged;
      case 4:
        if (!data.copyrightStatus) return false;
        if (data.copyrightStatus === "no") return data.wantsCopyrightFiling !== null;
        return true;
      case 5:
        return data.termsAccepted;
      default:
        return false;
    }
  };

  const canNavigateToStep = (targetStep: number): boolean => {
    // Can always go back
    if (targetStep < step) return true;
    // Can only go forward if all previous steps are complete
    for (let i = 1; i < targetStep; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const goToStep = (targetStep: FlowStep) => {
    if (canNavigateToStep(targetStep)) {
      setStep(targetStep);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN FORM
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-[var(--page-bg)]">
      {/* Header */}
      <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center px-[20px] sm:px-6">
        <button onClick={() => navigate("/rights/catalogue")} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Add Song</span>
      </header>

      {/* Main Content with Side Stepper */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Side Stepper - Hidden on mobile */}
        <aside className="hidden md:flex w-64 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex-col p-6">
          <nav className="space-y-1">
            {STEPS.map((s, index) => {
              const isActive = step === s.id;
              const isComplete = isStepComplete(s.id);
              const canNavigate = canNavigateToStep(s.id);
              
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id as FlowStep)}
                  disabled={!canNavigate}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                    isActive && "bg-[var(--muted-wash)]",
                    !isActive && canNavigate && "hover:bg-[var(--muted-wash)]/50",
                    !canNavigate && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Step indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-all",
                    isComplete && !isActive && "bg-success text-success-foreground",
                    isActive && "bg-[var(--btn-text)] text-white",
                    !isComplete && !isActive && "border-2 border-[var(--border-subtle)] text-[var(--btn-text-muted)]"
                  )}>
                    {isComplete && !isActive ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      s.id
                    )}
                  </div>
                  
                  {/* Step text */}
                  <div className="min-w-0">
                    <div className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-[var(--btn-text)]" : "text-[var(--btn-text-muted)]"
                    )}>
                      {s.label}
                    </div>
                    <div className="text-xs text-[var(--btn-text-muted)] truncate">
                      {s.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Progress Bar */}
        <div className="md:hidden absolute top-14 left-0 right-0 h-1 bg-[var(--border-subtle)] z-10">
          <div className="h-full bg-[var(--btn-text)] transition-all" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:pt-8">
            <div className="max-w-2xl">

          {/* STEP 1: SONG DETAILS */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-1">Song Details</h2>
                <p className="text-sm text-[var(--btn-text-muted)]">Basic information about your song</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--btn-text)]">Title <span className="text-destructive">*</span></label>
                <input type="text" value={data.title} onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter song title" className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20" />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--btn-text)]">Is there an alternate song title? <span className="text-destructive">*</span></label>
                <div className="flex gap-3">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(o => (
                    <button key={String(o.v)} onClick={() => setData(prev => ({ ...prev, hasAlternateTitle: o.v, alternateTitle: o.v ? prev.alternateTitle : "" }))} className={cn("px-5 py-2.5 text-sm font-medium rounded-xl border-2", data.hasAlternateTitle === o.v ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white" : "border-[var(--border-subtle)] text-[var(--btn-text)]")}>
                      {o.l}
                    </button>
                  ))}
                </div>
                {data.hasAlternateTitle && (
                  <input type="text" value={data.alternateTitle} onChange={(e) => setData(prev => ({ ...prev, alternateTitle: e.target.value }))} placeholder="Enter alternate title" className="w-full h-11 px-4 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--btn-text)]">Language</label>
                <select value={data.language} onChange={(e) => setData(prev => ({ ...prev, language: e.target.value }))} className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none">
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--btn-text)]">Song Type <span className="text-destructive">*</span></label>
                <select value={data.songType} onChange={(e) => setData(prev => ({ ...prev, songType: e.target.value as SongData["songType"] }))} className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none">
                  <option value="">Select type...</option>
                  {SONG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {["public_domain", "derivative", "medley"].includes(data.songType) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--btn-text)]">
                    {data.songType === "public_domain" && "Enter the title of the original public domain song"}
                    {data.songType === "derivative" && "Enter the title of the original composition"}
                    {data.songType === "medley" && "Enter the titles of other copyrights used"}
                    <span className="text-destructive">*</span>
                  </label>
                  <input type="text" value={data.originalWorkTitle} onChange={(e) => setData(prev => ({ ...prev, originalWorkTitle: e.target.value }))} placeholder="Original work title(s)" className="w-full h-11 px-4 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--btn-text)]">Has this song been recorded and released? <span className="text-destructive">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {[{ v: "yes" as const, l: "Yes" }, { v: "no" as const, l: "No" }, { v: "youtube_only" as const, l: "Yes - YouTube Only" }].map(o => (
                    <button key={o.v} onClick={() => setData(prev => ({ ...prev, releaseStatus: o.v }))} className={cn("px-5 py-2.5 text-sm font-medium rounded-xl border-2", data.releaseStatus === o.v ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white" : "border-[var(--border-subtle)] text-[var(--btn-text)]")}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              {data.releaseStatus && (
                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-[var(--btn-text)]">
                    {data.releaseStatus === "no" ? "Song creation year" : data.releaseStatus === "youtube_only" ? "First publication year on YouTube" : "First publication year"}
                    <span className="text-destructive">*</span>
                  </label>
                  <input type="number" min="1900" max={new Date().getFullYear()} value={data.releaseStatus === "no" ? data.creationYear : data.publicationYear} onChange={(e) => setData(prev => ({ ...prev, [data.releaseStatus === "no" ? "creationYear" : "publicationYear"]: e.target.value }))} placeholder={new Date().getFullYear().toString()} className="w-40 h-11 px-4 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                </div>
              )}

              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--btn-text)]">Writers <span className="text-destructive">*</span></label>
                  <span className={cn("text-xs font-medium", splitValid ? "text-success" : "text-warning")}>Total: {totalSplit.toFixed(2)}%</span>
                </div>
                <div className="space-y-4">
                  {data.writers.map((w, i) => (
                    w.fromDatabase && w.name ? (
                      // Selected writer chip view
                      <div key={w.id} className="p-4 bg-[var(--muted-wash)] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[var(--btn-text-muted)]">Writer {i + 1}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg">
                          <span className="font-medium text-sm">{w.name}</span>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-sm">
                              <input type="checkbox" checked={w.credit === "lyrics" || w.credit === "both"} onChange={(e) => {
                                const hasMusic = w.credit === "music" || w.credit === "both";
                                const newCredit = e.target.checked ? (hasMusic ? "both" : "lyrics") : (hasMusic ? "music" : "");
                                updateWriter(w.id, { credit: newCredit as Writer["credit"] });
                              }} className="h-4 w-4 rounded" />
                              Lyrics
                            </label>
                            <label className="flex items-center gap-1.5 text-sm">
                              <input type="checkbox" checked={w.credit === "music" || w.credit === "both"} onChange={(e) => {
                                const hasLyrics = w.credit === "lyrics" || w.credit === "both";
                                const newCredit = e.target.checked ? (hasLyrics ? "both" : "music") : (hasLyrics ? "lyrics" : "");
                                updateWriter(w.id, { credit: newCredit as Writer["credit"] });
                              }} className="h-4 w-4 rounded" />
                              Music
                            </label>
                            <button onClick={() => updateWriter(w.id, { name: "", pro: "", ipi: "", fromDatabase: false })} className="text-xs text-[var(--btn-text-muted)] hover:text-destructive flex items-center gap-1">
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </div>
                        
                        {/* PRO field - disabled when from database */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="relative">
                            <select value={w.pro} disabled className="h-10 w-full px-3 text-sm bg-muted/50 border border-[var(--border-subtle)] rounded-lg cursor-not-allowed opacity-70">
                              <option value="">PRO</option>
                              {PRO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <input type="number" step="0.01" value={w.split || ""} onChange={(e) => updateWriter(w.id, { split: parseFloat(e.target.value) || 0 })} placeholder="Split % *" className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg" />
                          <div>{/* Credit is now in the chip above */}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id={`ctrl-${w.id}`} checked={w.controlled} onChange={(e) => updateWriter(w.id, { controlled: e.target.checked })} className="h-4 w-4 rounded" />
                          <label htmlFor={`ctrl-${w.id}`} className="text-sm text-[var(--btn-text)]">I control rights for this writer</label>
                          <div className="group relative">
                            <HelpCircle className="h-4 w-4 text-[var(--btn-text-muted)] cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-[var(--btn-text)] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-10">Do you control the rights of this song for this songwriter?</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Search input view
                      <div key={w.id} className="p-4 bg-[var(--muted-wash)] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[var(--btn-text-muted)]">Writer {i + 1}</span>
                          {data.writers.length > 1 && <button onClick={() => removeWriter(w.id)} className="p-1 text-[var(--btn-text-muted)] hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                        
                        <div className="relative">
                          <input
                            type="text"
                            value={w.name}
                            onChange={(e) => {
                              updateWriter(w.id, { name: e.target.value, fromDatabase: false });
                              searchWriters(e.target.value, w.id);
                              setActiveWriterSearch(w.id);
                            }}
                            onFocus={() => setActiveWriterSearch(w.id)}
                            onBlur={() => setTimeout(() => setActiveWriterSearch(null), 200)}
                            placeholder="Begin typing to find existing songwriter"
                            className="w-full h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none"
                          />
                          
                          {/* Dropdown results */}
                          {activeWriterSearch === w.id && writerSearchResults[w.id]?.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-[var(--border-subtle)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {writerSearchResults[w.id].map((hit: any) => (
                                <button
                                  key={hit.objectID}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selectWriterFromDatabase(w.id, hit)}
                                  className="w-full px-4 py-3 text-left hover:bg-[var(--muted-wash)] border-b border-[var(--border-subtle)] last:border-b-0 transition-colors flex items-center justify-between gap-3"
                                >
                                  <span className="font-medium text-sm text-[var(--btn-text)]">{hit.name}</span>
                                  <span className="text-[11px] text-[var(--btn-text-muted)] bg-[var(--muted-wash)] px-2 py-0.5 rounded shrink-0">
                                    {hit.pro || "—"}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-[var(--btn-text-muted)] mt-2">
                          Can't find the songwriter you're looking for?{" "}
                          <a href="/rights/writers" className="text-[var(--app-focus)] hover:underline">
                            Register a new songwriter
                          </a>
                        </p>
                        
                        {/* Show PRO/Split/Credit fields only when not actively searching (dropdown closed) */}
                        {w.name && !w.fromDatabase && activeWriterSearch !== w.id && (
                          <>
                            <div className="grid grid-cols-3 gap-3">
                              <select value={w.pro} onChange={(e) => updateWriter(w.id, { pro: e.target.value })} className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg">
                                <option value="">PRO *</option>
                                {PRO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <input type="number" step="0.01" value={w.split || ""} onChange={(e) => updateWriter(w.id, { split: parseFloat(e.target.value) || 0 })} placeholder="Split % *" className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg" />
                              <select value={w.credit} onChange={(e) => updateWriter(w.id, { credit: e.target.value as Writer["credit"] })} className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg">
                                <option value="">Credit *</option>
                                <option value="lyrics">Lyrics</option>
                                <option value="music">Music</option>
                                <option value="both">Both</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id={`ctrl-${w.id}`} checked={w.controlled} onChange={(e) => updateWriter(w.id, { controlled: e.target.checked })} className="h-4 w-4 rounded" />
                              <label htmlFor={`ctrl-${w.id}`} className="text-sm text-[var(--btn-text)]">I control rights for this writer</label>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  ))}
                  <button onClick={addWriter} className="w-full py-3 text-sm font-medium text-[var(--btn-text)] border-2 border-dashed border-[var(--border-subtle)] rounded-xl hover:border-[var(--btn-text)]/30 flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add Writer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LYRICS */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-1">Lyrics</h2>
                <p className="text-sm text-[var(--btn-text-muted)]">{data.songType === "instrumental" ? "This is an instrumental - no lyrics needed." : "Add your song lyrics"}</p>
              </div>
              {data.songType !== "instrumental" && (
                <>
                  <div className="flex gap-3">
                    <button onClick={() => setData(prev => ({ ...prev, lyricsEntryMode: "paste" }))} className={cn("px-4 py-2 text-sm font-medium rounded-lg", data.lyricsEntryMode === "paste" ? "bg-[var(--btn-text)] text-white" : "bg-[var(--muted-wash)] text-[var(--btn-text)]")}>
                      Paste all lyrics
                    </button>
                    <button onClick={() => setData(prev => ({ ...prev, lyricsEntryMode: "sections" }))} className={cn("px-4 py-2 text-sm font-medium rounded-lg", data.lyricsEntryMode === "sections" ? "bg-[var(--btn-text)] text-white" : "bg-[var(--muted-wash)] text-[var(--btn-text)]")}>
                      Add by section
                    </button>
                  </div>
                  {data.lyricsEntryMode === "paste" && (
                    <div className="space-y-3">
                      <div className="p-4 bg-[var(--muted-wash)] rounded-xl text-sm text-[var(--btn-text-muted)] space-y-2">
                        <p className="font-medium text-[var(--btn-text)]">Guidelines:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Include section headings (Verse, Chorus, Bridge, Pre-Chorus, etc.) on their own line</li>
                          <li>Capitalize the first word of each line</li>
                          <li>Use (REPEAT) when a section repeats</li>
                          <li>Use (2X) at the end of a line if it's sung twice</li>
                        </ul>
                      </div>
                      <textarea 
                        value={data.lyricsFull} 
                        onChange={(e) => setData(prev => ({ ...prev, lyricsFull: e.target.value }))} 
                        placeholder={"Verse\nBefore the world was made\nThe word of God dwelt with the Father\n\nChorus\nHe is the King of kings\nAnd the Lord of lords..."} 
                        rows={15} 
                        className="w-full px-4 py-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none resize-y font-mono"
                      />
                      <div className="flex justify-between text-xs text-[var(--btn-text-muted)] mt-1">
                        <span>{data.lyricsFull.split('\n').filter(line => line.trim()).length} lines</span>
                        <span>{data.lyricsFull.length} characters</span>
                      </div>
                    </div>
                  )}
                  {data.lyricsEntryMode === "sections" && (
                    <div className="space-y-4">
                      {data.lyricsSections.map((s) => (
                        <div key={s.id} className="p-4 bg-[var(--muted-wash)] rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <select value={s.type} onChange={(e) => updateLyricSection(s.id, { type: e.target.value as LyricSection["type"] })} className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg">
                              <option value="">Select section...</option>
                              {LYRIC_SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <button onClick={() => removeLyricSection(s.id)} className="p-1 text-[var(--btn-text-muted)] hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <textarea value={s.content} onChange={(e) => updateLyricSection(s.id, { content: e.target.value })} placeholder="Enter lyrics..." rows={4} className="w-full px-3 py-2 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg resize-y" />
                        </div>
                      ))}
                      <button onClick={addLyricSection} className="w-full py-3 text-sm font-medium text-[var(--btn-text)] border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Add Section
                      </button>
                    </div>
                  )}
                  {((data.lyricsEntryMode === "paste" && data.lyricsFull) || (data.lyricsEntryMode === "sections" && data.lyricsSections.length > 0)) && (
                    <label className="flex items-start gap-3 p-4 bg-[var(--muted-wash)] rounded-xl cursor-pointer">
                      <input type="checkbox" checked={data.lyricsConfirmed} onChange={(e) => setData(prev => ({ ...prev, lyricsConfirmed: e.target.checked }))} className="w-5 h-5 mt-0.5 rounded border-2" />
                      <span className="text-sm text-[var(--btn-text)]">I confirm the accuracy of the lyrics entered and that the lyrics are original and do not infringe on the rights of any other copyright holder.</span>
                    </label>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3: CHORDS */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-1">Chord Chart</h2>
                <p className="text-sm text-[var(--btn-text-muted)]">Chord charts help with licensing and monetization</p>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-[var(--btn-text)]">Is a chord chart available? <span className="text-destructive">*</span></label>
                <div className="flex gap-3">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(o => (
                    <button key={String(o.v)} onClick={() => setData(prev => ({ ...prev, hasChordChart: o.v }))} className={cn("px-5 py-2.5 text-sm font-medium rounded-xl border-2", data.hasChordChart === o.v ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white" : "border-[var(--border-subtle)] text-[var(--btn-text)]")}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              {data.hasChordChart === true && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--btn-text)]">Upload chord chart</label>
                  <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-[var(--btn-text-muted)]" />
                    <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setData(prev => ({ ...prev, chordChartFile: e.target.files?.[0] || null }))} className="hidden" id="chord-upload" />
                    <label htmlFor="chord-upload" className="text-sm text-[var(--btn-text)] cursor-pointer hover:underline">Click to upload</label>
                    <p className="text-xs text-[var(--btn-text-muted)] mt-2">PDF, DOC, DOCX, PNG, or JPG</p>
                  </div>
                  {data.chordChartFile && <p className="text-sm text-success">✓ {data.chordChartFile.name}</p>}
                </div>
              )}
              {data.hasChordChart === false && (
                <label className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={data.chordChartAcknowledged} onChange={(e) => setData(prev => ({ ...prev, chordChartAcknowledged: e.target.checked }))} className="w-5 h-5 mt-0.5 rounded border-2 border-warning/50" />
                  <span className="text-sm text-warning">I understand that chord charts are required to properly license and monetize songs at CCLI and that I am not supplying a chord chart at this time.</span>
                </label>
              )}
            </div>
          )}

          {/* STEP 4: COPYRIGHT */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-1">Copyright</h2>
                <p className="text-sm text-[var(--btn-text-muted)]">Copyright protection status</p>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-[var(--btn-text)]">Has this song been filed for copyright protection? <span className="text-destructive">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {[{ v: "yes" as const, l: "Yes" }, { v: "no" as const, l: "No" }, { v: "unknown" as const, l: "I Don't Know" }].map(o => (
                    <button key={o.v} onClick={() => setData(prev => ({ ...prev, copyrightStatus: o.v, wantsCopyrightFiling: o.v === "no" ? null : prev.wantsCopyrightFiling }))} className={cn("px-5 py-2.5 text-sm font-medium rounded-xl border-2", data.copyrightStatus === o.v ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white" : "border-[var(--border-subtle)] text-[var(--btn-text)]")}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              {data.copyrightStatus === "no" && (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-[var(--btn-text)]">Do you want us to file this song for copyright protection for you?</label>
                  <p className="text-xs text-[var(--btn-text-muted)]">Cost and administration fees may incur. Please refer to your administration agreement.</p>
                  <div className="flex gap-3">
                    {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(o => (
                      <button key={String(o.v)} onClick={() => setData(prev => ({ ...prev, wantsCopyrightFiling: o.v }))} className={cn("px-5 py-2.5 text-sm font-medium rounded-xl border-2", data.wantsCopyrightFiling === o.v ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white" : "border-[var(--border-subtle)] text-[var(--btn-text)]")}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: AGREEMENT */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-1">Agreement</h2>
                <p className="text-sm text-[var(--btn-text-muted)]">Review and accept the terms</p>
              </div>
              <div className="p-6 bg-[var(--muted-wash)] rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--btn-text)]">
                  <Check className="h-4 w-4 text-success" /> Ready to submit
                </div>
                <p className="text-sm text-[var(--btn-text-muted)]">Your song "{data.title}" with {data.writers.length} writer{data.writers.length !== 1 ? "s" : ""} is ready for review.</p>
              </div>
              <label className="flex items-start gap-3 p-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl cursor-pointer">
                <input type="checkbox" checked={data.termsAccepted} onChange={(e) => setData(prev => ({ ...prev, termsAccepted: e.target.checked }))} className="w-5 h-5 mt-0.5 rounded border-2" />
                <span className="text-sm text-[var(--btn-text)]">
                  I agree to the <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="underline text-[var(--app-focus)]">Tribes Rights Management LLC Terms & Conditions</a>
                </span>
              </label>
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--topbar-bg)] p-4 sm:px-6">
        <div className="max-w-2xl flex items-center justify-between">
          <button onClick={goToPrevStep} className="px-5 py-2.5 text-sm font-medium rounded-lg text-[var(--btn-text)] hover:bg-[var(--muted-wash)]">Back</button>
          {step === 5 ? (
            <button onClick={submit} disabled={!canAdvanceStep() || isSubmitting} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? "Submitting..." : "Submit Song"} <Send className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={goToNextStep} disabled={!canAdvanceStep()} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
