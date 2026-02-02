import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Check, ChevronRight, Music, Users, FileText, Shield, Send, Sparkles, Edit3, Plus, Trash2, X, HelpCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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
  type: "verse" | "chorus" | "bridge" | "pre-chorus" | "outro" | "intro" | "tag" | "";
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
type EntryMode = "choice" | "voice" | "confirm" | "form";

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
  { value: "bridge", label: "Bridge" },
  { value: "pre-chorus", label: "Pre-Chorus" },
  { value: "intro", label: "Intro" },
  { value: "outro", label: "Outro" },
  { value: "tag", label: "Tag" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// AI PARSING
// ═══════════════════════════════════════════════════════════════════════════════

async function parseVoiceWithAI(transcript: string): Promise<{ title: string; writers: string[] }> {
  try {
    const { data, error } = await supabase.functions.invoke('parse-voice', {
      body: { transcript }
    });
    if (error) throw error;
    return {
      title: data?.title || "",
      writers: Array.isArray(data?.writers) ? data.writers : [],
    };
  } catch (err) {
    console.error("AI parsing failed:", err);
    return { title: "", writers: [] };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SongSubmitPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [entryMode, setEntryMode] = useState<EntryMode>("choice");
  const [step, setStep] = useState<FlowStep>(1);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [parsedTitle, setParsedTitle] = useState("");
  const [parsedWriters, setParsedWriters] = useState<string[]>([]);
  
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
    writers: [],
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

  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (entryMode === "voice" && voiceTranscript) {
          processVoiceEntry(voiceTranscript);
        }
      };
    }
  }, [entryMode, voiceTranscript]);

  const startVoiceEntry = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported");
      return;
    }
    setVoiceTranscript("");
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopVoiceEntry = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceEntry = async (transcript: string) => {
    setIsProcessing(true);
    const { title, writers } = await parseVoiceWithAI(transcript);
    
    try {
      await supabase.from("voice_transcripts").insert({
        transcript,
        parsed_title: title,
        parsed_writers: writers,
        success: !!(title && writers.length > 0),
      });
    } catch (err) {
      console.error("Failed to log transcript:", err);
    }
    
    setParsedTitle(title);
    setParsedWriters(writers.length > 0 ? writers : ["(Your name)"]);
    setIsProcessing(false);
    setEntryMode("confirm");
  };

  const confirmVoiceEntry = () => {
    const writers: Writer[] = parsedWriters.map((name) => ({
      id: crypto.randomUUID(),
      name,
      pro: "",
      ipi: "",
      split: 0,
      credit: "",
      controlled: name === "(Your name)",
      fromDatabase: false,
    }));
    
    setData(prev => ({ ...prev, title: parsedTitle, writers }));
    setEntryMode("form");
    setStep(1);
  };

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // CHOICE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════

  if (entryMode === "choice") {
    return (
      <div className="h-full flex flex-col bg-[var(--page-bg)]">
        <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center px-4 sm:px-6">
          <button onClick={() => navigate("/rights/catalogue")} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Add Song</span>
        </header>
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center p-6 overflow-y-auto">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[var(--muted-wash)] flex items-center justify-center mx-auto mb-4">
                  <Music className="h-7 w-7 text-[var(--btn-text)]" />
                </div>
                <h1 className="text-2xl font-semibold text-[var(--btn-text)] mb-2">Add a new song</h1>
                <p className="text-[var(--btn-text-muted)]">How would you like to get started?</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => setEntryMode("voice")} className="w-full p-5 rounded-2xl border-2 border-[var(--border-subtle)] hover:border-[var(--btn-text)]/30 text-left group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--btn-text)] text-white flex items-center justify-center shrink-0">
                      <Mic className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--btn-text)] mb-1">Tell me about it</div>
                      <p className="text-sm text-[var(--btn-text-muted)]">Say the song title and who wrote it.</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => setEntryMode("form")} className="w-full p-5 rounded-2xl border-2 border-[var(--border-subtle)] hover:border-[var(--btn-text)]/30 text-left group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--muted-wash)] text-[var(--btn-text)] flex items-center justify-center shrink-0">
                      <Edit3 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--btn-text)] mb-1">I'll type it out</div>
                      <p className="text-sm text-[var(--btn-text-muted)]">Fill out the form step by step.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // VOICE ENTRY SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════

  if (entryMode === "voice") {
    return (
      <div className="h-full flex flex-col bg-[var(--page-bg)]">
        <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button onClick={() => { stopVoiceEntry(); setEntryMode("choice"); }} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Voice Entry</span>
          </div>
          <button onClick={() => { stopVoiceEntry(); setEntryMode("form"); }} className="text-sm text-[var(--btn-text-muted)]">Skip to form</button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            {isListening ? (
              <>
                <div className="relative w-32 h-32 mx-auto mb-8 pointer-events-none">
                  <div className="absolute inset-0 rounded-full bg-[var(--btn-text)]/10 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-[var(--btn-text)]/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-[var(--btn-text)] flex items-center justify-center">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-2">Listening...</h2>
                <p className="text-[var(--btn-text-muted)] mb-6">Tell me about your song</p>
                {voiceTranscript && (
                  <div className="p-4 bg-[var(--muted-wash)] rounded-xl text-left mb-8 max-h-32 overflow-y-auto">
                    <p className="text-sm text-[var(--btn-text)]">{voiceTranscript}</p>
                  </div>
                )}
                <button type="button" onClick={() => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); if (voiceTranscript) processVoiceEntry(voiceTranscript); else setEntryMode("form"); }} className="relative z-10 px-8 py-4 text-base font-medium rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Done speaking
                </button>
              </>
            ) : isProcessing ? (
              <>
                <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-[var(--btn-text)] animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-2">Processing...</h2>
                <p className="text-[var(--btn-text-muted)]">Extracting song details</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-2">Tell me about your song</h2>
                <p className="text-[var(--btn-text-muted)] mb-8">Say the song title and who wrote it.</p>
                <button onClick={startVoiceEntry} className="px-8 py-4 text-base font-medium rounded-2xl bg-[var(--btn-text)] text-white hover:opacity-90 flex items-center gap-3 mx-auto">
                  <Mic className="h-5 w-5" /> Start speaking
                </button>
                <p className="text-xs text-[var(--btn-text-muted)] mt-6">Example: "It's called Christmas Hoedown, written by me and Joshua Carpenter"</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONFIRMATION SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════

  if (entryMode === "confirm") {
    return (
      <div className="h-full flex flex-col bg-[var(--page-bg)]">
        <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center px-4 sm:px-6">
          <button onClick={() => setEntryMode("voice")} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Confirm Details</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7 text-success" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--btn-text)] mb-2">Got it!</h1>
              <p className="text-[var(--btn-text-muted)]">Please review and edit if needed.</p>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-[var(--btn-text-muted)] uppercase tracking-wider mb-2">Song Title</label>
              <input type="text" value={parsedTitle} onChange={(e) => setParsedTitle(e.target.value)} placeholder="Enter song title" className="w-full h-12 px-4 text-base bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20" />
            </div>
            <div className="mb-8">
              <label className="block text-xs font-medium text-[var(--btn-text-muted)] uppercase tracking-wider mb-2">Writers</label>
              <div className="space-y-2">
                {parsedWriters.map((writer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={writer} onChange={(e) => { const u = [...parsedWriters]; u[index] = e.target.value; setParsedWriters(u); }} placeholder="Writer name" className="flex-1 h-11 px-4 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                    {parsedWriters.length > 1 && (
                      <button onClick={() => setParsedWriters(parsedWriters.filter((_, i) => i !== index))} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setParsedWriters([...parsedWriters, ""])} className="w-full h-11 text-sm font-medium text-[var(--btn-text-muted)] border-2 border-dashed border-[var(--border-subtle)] rounded-xl hover:border-[var(--btn-text)]/30 flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Add writer
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={confirmVoiceEntry} disabled={!parsedTitle.trim() || parsedWriters.length === 0 || parsedWriters.some(w => !w.trim())} className="w-full h-12 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setEntryMode("voice")} className="w-full h-12 text-sm font-medium rounded-xl text-[var(--btn-text-muted)] hover:bg-[var(--muted-wash)]">
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN FORM
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-[var(--page-bg)]">
      <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <button onClick={goToPrevStep} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Add Song</span>
        </div>
        <span className="text-xs text-[var(--btn-text-muted)]">Step {step} of 5</span>
      </header>

      <div className="shrink-0 h-1 bg-[var(--border-subtle)]">
        <div className="h-full bg-[var(--btn-text)] transition-all" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">

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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--btn-text)]">
                    {data.releaseStatus === "no" ? "Song creation year" : data.releaseStatus === "youtube_only" ? "First publication year on YouTube" : "First publication year"}
                    <span className="text-destructive">*</span>
                  </label>
                  <input type="number" min="1900" max={new Date().getFullYear()} value={data.releaseStatus === "no" ? data.creationYear : data.publicationYear} onChange={(e) => setData(prev => ({ ...prev, [data.releaseStatus === "no" ? "creationYear" : "publicationYear"]: e.target.value }))} placeholder={new Date().getFullYear().toString()} className="w-40 h-11 px-4 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--btn-text)]">Writers <span className="text-destructive">*</span></label>
                  <span className={cn("text-xs font-medium", splitValid ? "text-success" : "text-warning")}>Total: {totalSplit.toFixed(2)}%</span>
                </div>
                <div className="space-y-4">
                  {data.writers.map((w, i) => (
                    <div key={w.id} className="p-4 bg-[var(--muted-wash)] rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--btn-text-muted)]">Writer {i + 1}</span>
                        {data.writers.length > 1 && <button onClick={() => removeWriter(w.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                      </div>
                      <input type="text" value={w.name} onChange={(e) => updateWriter(w.id, { name: e.target.value })} placeholder="Writer name" className="w-full h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none" />
                      <div className="grid grid-cols-3 gap-3">
                        <select value={w.pro} onChange={(e) => updateWriter(w.id, { pro: e.target.value })} className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none">
                          <option value="">PRO *</option>
                          {PRO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input type="number" step="0.01" value={w.split || ""} onChange={(e) => updateWriter(w.id, { split: parseFloat(e.target.value) || 0 })} placeholder="Split % *" className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none" />
                        <select value={w.credit} onChange={(e) => updateWriter(w.id, { credit: e.target.value as Writer["credit"] })} className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none">
                          <option value="">Credit *</option>
                          <option value="lyrics">Lyrics</option>
                          <option value="music">Music</option>
                          <option value="both">Both</option>
                        </select>
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
                    <textarea value={data.lyricsFull} onChange={(e) => setData(prev => ({ ...prev, lyricsFull: e.target.value }))} placeholder="Paste your lyrics here..." rows={15} className="w-full px-4 py-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none resize-y" />
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
                            <button onClick={() => removeLyricSection(s.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
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
                  <span className="text-sm text-warning-foreground">I understand that chord charts are required to properly license and monetize songs at CCLI and that I am not supplying a chord chart at this time.</span>
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

      <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--topbar-bg)] p-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={goToPrevStep} className="px-5 py-2.5 text-sm font-medium rounded-xl text-[var(--btn-text)] hover:bg-[var(--muted-wash)]">Back</button>
          {step === 5 ? (
            <button onClick={submit} disabled={!canAdvanceStep() || isSubmitting} className="px-6 py-2.5 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? "Submitting..." : "Submit Song"} <Send className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={goToNextStep} disabled={!canAdvanceStep()} className="px-6 py-2.5 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
