import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Check, ChevronRight, Music, Users, FileText, Shield, Send, Sparkles, Edit3, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * SONG SUBMIT — AI-ASSISTED CONVERSATIONAL FLOW
 * 
 * Smart, voice-friendly registration that feels like magic.
 * AI guides and auto-fills, user just talks naturally.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Writer {
  id: string;
  name: string;
  pro: string;
  ipi: string;
  split: number;
  controlled: boolean;
  fromDatabase: boolean;
}

interface SongData {
  title: string;
  alternateTitle: string;
  type: "original" | "instrumental" | "public_domain" | "derivative" | "medley" | "";
  originalWork: string;
  language: string;
  year: string;
  released: boolean | null;
  writers: Writer[];
  lyrics: string;
  lyricsConfirmed: boolean;
  hasChordChart: boolean | null;
  chordChartFile: File | null;
  chordChartAcknowledged: boolean;
  copyrightStatus: "registered" | "not_registered" | "unknown" | "";
  wantsCopyrightFiling: boolean;
  termsAccepted: boolean;
}

interface FieldStatus {
  filled: boolean;
  value: string;
  confidence: "high" | "medium" | "needs_confirm";
}

type FlowStep = "title" | "writers" | "lyrics" | "details" | "review";

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWN WRITERS DATABASE (would come from Supabase in production)
// ═══════════════════════════════════════════════════════════════════════════════

const KNOWN_WRITERS: Record<string, { pro: string; ipi: string }> = {
  "chris tomlin": { pro: "BMI", ipi: "00274837264" },
  "louie giglio": { pro: "BMI", ipi: "00385746283" },
  "matt redman": { pro: "PRS", ipi: "00192837465" },
  "hillsong": { pro: "APRA", ipi: "00847362514" },
  "bethel music": { pro: "ASCAP", ipi: "00736251847" },
};

const PUBLIC_DOMAIN_PATTERNS = [
  { pattern: /amazing grace/i, original: "Amazing Grace", type: "public_domain" as const },
  { pattern: /how great thou art/i, original: "How Great Thou Art", type: "public_domain" as const },
  { pattern: /be thou my vision/i, original: "Be Thou My Vision", type: "public_domain" as const },
  { pattern: /come thou fount/i, original: "Come Thou Fount of Every Blessing", type: "public_domain" as const },
];

// ═══════════════════════════════════════════════════════════════════════════════
// AI PARSING — LIMITED TO TITLE AND WRITERS ONLY
// ═══════════════════════════════════════════════════════════════════════════════

function parseVoiceInput(input: string): { title: string; writers: string[] } {
  let title = "";
  const writers: string[] = [];
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Extract song title
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Pattern 1: "called/titled [TITLE] written by" or "called [TITLE] by"
  const calledMatch = input.match(/(?:called|titled)\s+["']?(.+?)["']?\s+(?:written\s+by|by\s+)/i);
  if (calledMatch) {
    title = calledMatch[1].trim();
  }
  
  // Pattern 2: "called/titled [TITLE]" at end (no writers mentioned)
  if (!title) {
    const calledEndMatch = input.match(/(?:called|titled)\s+["']?([^"']+?)["']?\s*$/i);
    if (calledEndMatch) {
      title = calledEndMatch[1].trim();
    }
  }
  
  // Pattern 3: Quoted title anywhere - "Title" or 'Title'
  if (!title) {
    const quotedMatch = input.match(/["']([^"']{2,60})["']/);
    if (quotedMatch) {
      title = quotedMatch[1].trim();
    }
  }
  
  // Clean and format title
  if (title) {
    title = title.replace(/\s+(?:written|by)$/i, '').trim();
    title = toTitleCase(title);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Extract writers
  // ─────────────────────────────────────────────────────────────────────────────
  
  const writerMatch = input.match(/(?:written\s+by|by)\s+(.+?)(?:\s*[.!?]|$)/i);
  if (writerMatch) {
    let writerStr = writerMatch[1].trim();
    
    // Clean trailing noise
    writerStr = writerStr
      .replace(/\s+(?:in|from|back|last|this|split|and\s+it|we\s+wrote|,\s*\d).*$/i, '')
      .trim();
    
    const rawNames = writerStr
      .split(/(?:\s+and\s+|\s*&\s*|\s*,\s*(?:and\s+)?)/i)
      .map(n => n.trim())
      .filter(n => n.length > 0 && n.length < 50);
    
    const seen = new Set<string>();
    
    for (const name of rawNames) {
      const lower = name.toLowerCase();
      
      // Normalize first-person references to a placeholder
      if (/^(me|myself|i)$/i.test(name)) {
        if (!seen.has("_self_")) {
          writers.push("(Your name)");
          seen.add("_self_");
        }
        continue;
      }
      
      // Skip duplicates
      if (seen.has(lower)) continue;
      seen.add(lower);
      
      writers.push(toTitleCase(name));
    }
  }
  
  return { title, writers };
}

// Helper: Convert to Title Case
function toTitleCase(str: string): string {
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet']);
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

function detectLyricSections(lyrics: string): string {
  const lines = lyrics.split("\n");
  let formatted = "";
  let currentSection = "";
  
  const sectionPatterns = [
    { pattern: /^\[?(verse|v)\s*\d*\]?:?\s*$/i, label: "VERSE" },
    { pattern: /^\[?(chorus|ch)\]?:?\s*$/i, label: "CHORUS" },
    { pattern: /^\[?(bridge|br)\]?:?\s*$/i, label: "BRIDGE" },
    { pattern: /^\[?(pre-?chorus|pc)\]?:?\s*$/i, label: "PRE-CHORUS" },
    { pattern: /^\[?(outro)\]?:?\s*$/i, label: "OUTRO" },
    { pattern: /^\[?(intro)\]?:?\s*$/i, label: "INTRO" },
  ];
  
  for (const line of lines) {
    let foundSection = false;
    for (const { pattern, label } of sectionPatterns) {
      if (pattern.test(line.trim())) {
        currentSection = label;
        formatted += `\n[${label}]\n`;
        foundSection = true;
        break;
      }
    }
    if (!foundSection && line.trim()) {
      formatted += line + "\n";
    }
  }
  
  return formatted.trim() || lyrics;
}

// Parse free-form natural language input during flow steps
function parseNaturalInput(input: string, currentData: SongData): Partial<SongData> {
  const updates: Partial<SongData> = {};
  const lower = input.toLowerCase().trim();
  
  // If input looks like just a title (no "by" or "written")
  if (!currentData.title && !lower.includes(" by ") && !lower.includes("written")) {
    updates.title = toTitleCase(input.trim());
    return updates;
  }
  
  // If it contains writer info
  if (lower.includes(" by ") || lower.includes("written")) {
    const parsed = parseVoiceInput(input);
    if (parsed.title && !currentData.title) {
      updates.title = parsed.title;
    }
    if (parsed.writers.length > 0 && currentData.writers.length === 0) {
      updates.writers = parsed.writers.map((name, i) => ({
        id: crypto.randomUUID(),
        name,
        pro: KNOWN_WRITERS[name.toLowerCase()]?.pro || "",
        ipi: KNOWN_WRITERS[name.toLowerCase()]?.ipi || "",
        split: Math.floor(100 / parsed.writers.length),
        controlled: i === 0,
        fromDatabase: !!KNOWN_WRITERS[name.toLowerCase()],
      }));
    }
    return updates;
  }
  
  // Default: treat as title
  if (!currentData.title) {
    updates.title = toTitleCase(input.trim());
  }
  
  return updates;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type EntryMode = "choice" | "voice" | "confirm" | "flow";

export default function SongSubmitPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [entryMode, setEntryMode] = useState<EntryMode>("choice");
  const [step, setStep] = useState<FlowStep>("title");
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  
  // Parsed voice data for confirmation screen
  const [parsedTitle, setParsedTitle] = useState("");
  const [parsedWriters, setParsedWriters] = useState<string[]>([]);
  
  const [data, setData] = useState<SongData>({
    title: "",
    alternateTitle: "",
    type: "",
    originalWork: "",
    language: "English",
    year: "",
    released: null,
    writers: [],
    lyrics: "",
    lyricsConfirmed: false,
    hasChordChart: null,
    chordChartFile: null,
    chordChartAcknowledged: false,
    copyrightStatus: "",
    wantsCopyrightFiling: false,
    termsAccepted: false,
  });

  // Speech recognition
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        
        if (entryMode === "voice") {
          setVoiceTranscript(transcript);
        } else {
          setInput(transcript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        
        // If in voice entry mode and we have a transcript, process it
        if (entryMode === "voice" && voiceTranscript) {
          processVoiceEntry(voiceTranscript);
        }
      };
    }
  }, [entryMode, voiceTranscript]);

  const startVoiceEntry = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser");
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

  const processVoiceEntry = (transcript: string) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const { title, writers } = parseVoiceInput(transcript);
      
      // Store parsed data for confirmation
      setParsedTitle(title);
      setParsedWriters(writers);
      
      setIsProcessing(false);
      setEntryMode("confirm");
    }, 500);
  };

  const confirmVoiceEntry = () => {
    // Build writers array with equal splits
    const writerCount = parsedWriters.length;
    const splitEach = writerCount > 0 ? Math.floor(10000 / writerCount) / 100 : 0;
    
    const writers: Writer[] = parsedWriters.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      pro: "",
      ipi: "",
      split: i === writerCount - 1 ? Math.round((100 - splitEach * (writerCount - 1)) * 100) / 100 : splitEach,
      controlled: name === "(Your name)",
      fromDatabase: false,
    }));
    
    // Update data and move to flow
    setData(prev => ({
      ...prev,
      title: parsedTitle,
      writers,
    }));
    
    setEntryMode("flow");
    setStep("lyrics"); // Skip to lyrics since we have title and writers
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const goBackFromChoice = () => {
    navigate("/rights/catalogue");
  };

  const processInput = () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate brief processing delay for natural feel
    setTimeout(() => {
      const updates = parseNaturalInput(input, data);
      
      if (Object.keys(updates).length > 0) {
        setData(prev => ({ ...prev, ...updates }));
      }
      
      setInput("");
      setIsProcessing(false);
      
      // Auto-advance logic
      if (step === "title" && (updates.title || data.title)) {
        if ((updates.writers && updates.writers.length > 0) || data.writers.length > 0) {
          // Already have writers, maybe skip to lyrics
        }
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processInput();
    }
  };

  const advanceStep = () => {
    const steps: FlowStep[] = ["title", "writers", "lyrics", "details", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const steps: FlowStep[] = ["title", "writers", "lyrics", "details", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      navigate("/rights/catalogue");
    }
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case "title":
        return !!data.title && data.writers.length > 0 && data.writers.every(w => w.name && w.split > 0);
      case "writers":
        return data.writers.length > 0 && Math.abs(data.writers.reduce((s, w) => s + w.split, 0) - 100) < 0.01;
      case "lyrics":
        return data.type === "instrumental" || (!!data.lyrics && data.lyricsConfirmed);
      case "details":
        return !!data.year && data.released !== null && (data.hasChordChart === true || data.chordChartAcknowledged);
      case "review":
        return data.termsAccepted;
      default:
        return false;
    }
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("songs").insert({
        title: data.title,
        alternate_titles: data.alternateTitle ? [data.alternateTitle] : null,
        language: data.language,
        genre: data.type || "original",
        release_date: data.released && data.year ? `${data.year}-01-01` : null,
        metadata: {
          type: data.type || "original",
          original_work: data.originalWork || null,
          year: data.year,
          released: data.released,
          lyrics: data.lyrics,
          lyrics_confirmed: data.lyricsConfirmed,
          has_chord_chart: data.hasChordChart,
          copyright_status: data.copyrightStatus,
          wants_copyright_filing: data.wantsCopyrightFiling,
          writers: data.writers.map(w => ({
            name: w.name,
            pro: w.pro,
            ipi: w.ipi,
            split: w.split,
            controlled: w.controlled,
          })),
        },
        is_active: false,
      });
      
      if (error) throw error;
      toast.success("Song submitted successfully");
      navigate("/rights/catalogue");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrompt = (): string => {
    switch (step) {
      case "title":
        if (!data.title) return "What's your song called?";
        if (data.writers.length === 0) return "Who wrote it?";
        if (data.writers.some(w => !w.split)) return "How should we split the ownership?";
        return "Anything else about the song?";
      case "writers":
        return "Add or adjust writers and splits";
      case "lyrics":
        if (data.type === "instrumental") return "No lyrics needed for instrumentals";
        return "Paste or speak your lyrics";
      case "details":
        if (!data.year) return "What year was it written?";
        if (data.released === null) return "Has it been released?";
        if (data.hasChordChart === null) return "Do you have a chord chart?";
        return "Any other details?";
      case "review":
        return "Review and submit";
      default:
        return "";
    }
  };

  const stepNumber = ["title", "writers", "lyrics", "details", "review"].indexOf(step) + 1;

  // ═══════════════════════════════════════════════════════════════════════════════
  // ENTRY CHOICE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════
  
  if (entryMode === "choice") {
    return (
      <div className="h-full flex flex-col bg-[var(--page-bg)]">
        <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center px-4 sm:px-6">
          <button onClick={goBackFromChoice} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] transition-colors text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Add Song</span>
        </header>

        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center p-6 overflow-y-auto">
            <div className="max-w-md w-full">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-[var(--muted-wash)] flex items-center justify-center mx-auto mb-6">
                  <Music className="h-8 w-8 text-[var(--btn-text)]" />
                </div>
                
                <h1 className="text-2xl font-semibold text-[var(--btn-text)] mb-2">
                  Add a new song
                </h1>
                <p className="text-[var(--btn-text-muted)]">
                  How would you like to get started?
                </p>
              </div>

              <div className="space-y-4">
              {/* Voice Option */}
              <button
                onClick={() => setEntryMode("voice")}
                className="w-full p-6 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl text-left hover:border-[var(--btn-text)]/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--btn-text)] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--btn-text)] mb-1">Tell me about it</div>
                    <p className="text-sm text-[var(--btn-text-muted)] leading-relaxed">
                      Say the song title and who wrote it.
                    </p>
                  </div>
                </div>
              </button>

              {/* Manual Option */}
              <button
                onClick={() => setEntryMode("flow")}
                className="w-full p-6 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl text-left hover:border-[var(--btn-text)]/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--muted-wash)] text-[var(--btn-text)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Edit3 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--btn-text)] mb-1">I'll type it out</div>
                    <p className="text-sm text-[var(--btn-text-muted)] leading-relaxed">
                      Go step by step through the registration form.
                    </p>
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
            <button onClick={() => { stopVoiceEntry(); setEntryMode("choice"); }} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] transition-colors text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Voice Entry</span>
          </div>
          <button
            onClick={() => { stopVoiceEntry(); setEntryMode("flow"); }}
            className="text-sm text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]"
          >
            Skip to form
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            {/* Listening State */}
            {isListening ? (
              <>
                <div className="relative w-32 h-32 mx-auto mb-8 pointer-events-none">
                  {/* Pulse rings - non-interactive */}
                  <div className="absolute inset-0 rounded-full bg-[var(--btn-text)]/10 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-[var(--btn-text)]/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-[var(--btn-text)] flex items-center justify-center">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-2">Listening...</h2>
                <p className="text-[var(--btn-text-muted)] mb-6">Tell me about your song</p>
                
                {/* Live transcript */}
                {voiceTranscript && (
                  <div className="p-4 bg-[var(--muted-wash)] rounded-xl text-left mb-8 max-h-32 overflow-y-auto">
                    <p className="text-sm text-[var(--btn-text)]">{voiceTranscript}</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    if (recognitionRef.current) {
                      recognitionRef.current.stop();
                    }
                    setIsListening(false);
                    if (voiceTranscript) {
                      processVoiceEntry(voiceTranscript);
                    } else {
                      setEntryMode("flow");
                    }
                  }}
                  className="relative z-10 px-8 py-3 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 transition-all cursor-pointer"
                >
                  Done speaking
                </button>
              </>
            ) : isProcessing ? (
              <>
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[var(--muted-wash)] flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-[var(--btn-text)] animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-2">Processing...</h2>
                <p className="text-[var(--btn-text-muted)]">Extracting song details</p>
              </>
            ) : (
              <>
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[var(--muted-wash)] flex items-center justify-center">
                  <Mic className="h-10 w-10 text-[var(--btn-text-muted)]" />
                </div>
                
                <h2 className="text-xl font-semibold text-[var(--btn-text)] mb-2">Tell me about your song</h2>
                <p className="text-[var(--btn-text-muted)] mb-8 max-w-sm mx-auto">
                  Say the song title and who wrote it.
                </p>
                
                <button
                  onClick={startVoiceEntry}
                  className="px-8 py-4 text-base font-medium rounded-2xl bg-[var(--btn-text)] text-white hover:opacity-90 transition-all flex items-center gap-3 mx-auto"
                >
                  <Mic className="h-5 w-5" />
                  Start speaking
                </button>
                
                <p className="text-xs text-[var(--btn-text-muted)] mt-6">
                  Example: "It's called Christmas Hoedown, written by me and Joshua Carpenter"
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONFIRMATION SCREEN — Edit title & writers before continuing
  // ═══════════════════════════════════════════════════════════════════════════════
  
  if (entryMode === "confirm") {
    return (
      <div className="h-full flex flex-col bg-[var(--page-bg)]">
        <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button onClick={() => setEntryMode("voice")} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] transition-colors text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Confirm Details</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--btn-text)] mb-2">Got it!</h1>
              <p className="text-[var(--btn-text-muted)]">Please review and edit if needed.</p>
            </div>

            {/* Song Title */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[var(--btn-text-muted)] uppercase tracking-wider mb-2">
                Song Title
              </label>
              <input
                type="text"
                value={parsedTitle}
                onChange={(e) => setParsedTitle(e.target.value)}
                placeholder="Enter song title"
                className="w-full h-12 px-4 text-base bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 focus:border-[var(--app-focus)]/40 transition-all"
              />
            </div>

            {/* Writers */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-[var(--btn-text-muted)] uppercase tracking-wider mb-2">
                Writers
              </label>
              <div className="space-y-2">
                {parsedWriters.map((writer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={writer}
                      onChange={(e) => {
                        const updated = [...parsedWriters];
                        updated[index] = e.target.value;
                        setParsedWriters(updated);
                      }}
                      placeholder="Writer name"
                      className="flex-1 h-11 px-4 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 transition-all"
                    />
                    {parsedWriters.length > 1 && (
                      <button
                        onClick={() => setParsedWriters(parsedWriters.filter((_, i) => i !== index))}
                        className="p-2 rounded-lg hover:bg-red-50 text-[var(--btn-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setParsedWriters([...parsedWriters, ""])}
                  className="w-full h-11 text-sm font-medium text-[var(--btn-text-muted)] border-2 border-dashed border-[var(--border-subtle)] rounded-xl hover:border-[var(--btn-text)]/30 hover:text-[var(--btn-text)] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add writer
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmVoiceEntry}
                disabled={!parsedTitle.trim() || parsedWriters.length === 0 || parsedWriters.some(w => !w.trim())}
                className="w-full h-12 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEntryMode("voice")}
                className="w-full h-12 text-sm font-medium rounded-xl text-[var(--btn-text-muted)] hover:bg-[var(--muted-wash)] transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN FLOW
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-[var(--page-bg)]">
      {/* Header */}
      <header className="shrink-0 h-14 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] transition-colors text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Add Song</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--btn-text-muted)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Assisted</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Input Area */}
        <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-12 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {["title", "writers", "lyrics", "details", "review"].map((s, i) => (
                <div key={s} className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  i < stepNumber ? "bg-[var(--btn-text)]" : "bg-[var(--border-subtle)]"
                )} />
              ))}
            </div>

            {/* Prompt */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--btn-text)] mb-8">
              {getPrompt()}
            </h1>

            {/* Dynamic Input Area */}
            {step === "title" && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={data.title ? "Add writers, year, or other details..." : "Song title, writers, year..."}
                    className="w-full h-14 pl-5 pr-14 text-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl placeholder:text-[var(--btn-text-muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 focus:border-[var(--app-focus)]/40 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={toggleListening}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all",
                      isListening ? "bg-red-500 text-white" : "bg-[var(--muted-wash)] text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]"
                    )}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>
                
                {input && (
                  <button
                    onClick={processInput}
                    disabled={isProcessing}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Add"}
                  </button>
                )}
                
                <p className="text-sm text-[var(--btn-text-muted)]">
                  Try: "Amazing Grace My Chains Are Gone, written by me and Chris Tomlin, 50/50 split, 2006"
                </p>
              </div>
            )}

            {step === "lyrics" && data.type !== "instrumental" && (
              <div className="space-y-4">
                <textarea
                  ref={textareaRef}
                  value={data.lyrics}
                  onChange={(e) => setData(prev => ({ ...prev, lyrics: e.target.value }))}
                  onBlur={() => {
                    if (data.lyrics) {
                      setData(prev => ({ ...prev, lyrics: detectLyricSections(prev.lyrics) }));
                    }
                  }}
                  placeholder="Paste your lyrics here..."
                  rows={12}
                  className="w-full px-5 py-4 text-base bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl placeholder:text-[var(--btn-text-muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 transition-all resize-y"
                />
                
                {data.lyrics && (
                  <label className="flex items-center gap-3 p-4 bg-[var(--muted-wash)] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.lyricsConfirmed}
                      onChange={(e) => setData(prev => ({ ...prev, lyricsConfirmed: e.target.checked }))}
                      className="w-5 h-5 rounded border-2 border-[var(--border-strong)] text-[var(--btn-text)] focus:ring-[var(--app-focus)] focus:ring-offset-0"
                    />
                    <span className="text-sm text-[var(--btn-text)]">These lyrics are accurate and original</span>
                  </label>
                )}
              </div>
            )}

            {step === "details" && (
              <div className="space-y-6">
                {!data.year && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--btn-text)]">Year written</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={data.year}
                      onChange={(e) => setData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder={new Date().getFullYear().toString()}
                      className="w-32 h-12 px-4 text-base bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20 transition-all"
                    />
                  </div>
                )}
                
                {data.year && data.released === null && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--btn-text)]">Has it been released?</label>
                    <div className="flex gap-3">
                      {[{ v: true, l: "Yes" }, { v: false, l: "Not yet" }].map(o => (
                        <button
                          key={String(o.v)}
                          onClick={() => setData(prev => ({ ...prev, released: o.v }))}
                          className={cn(
                            "px-5 py-3 text-sm font-medium rounded-xl border-2 transition-all",
                            data.released === o.v
                              ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white"
                              : "border-[var(--border-subtle)] text-[var(--btn-text)] hover:border-[var(--btn-text)]/30"
                          )}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.released !== null && data.hasChordChart === null && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--btn-text)]">Do you have a chord chart?</label>
                    <div className="flex gap-3">
                      {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(o => (
                        <button
                          key={String(o.v)}
                          onClick={() => setData(prev => ({ ...prev, hasChordChart: o.v }))}
                          className={cn(
                            "px-5 py-3 text-sm font-medium rounded-xl border-2 transition-all",
                            data.hasChordChart === o.v
                              ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white"
                              : "border-[var(--border-subtle)] text-[var(--btn-text)] hover:border-[var(--btn-text)]/30"
                          )}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                    
                    {data.hasChordChart === false && !data.chordChartAcknowledged && (
                      <label className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={data.chordChartAcknowledged}
                          onChange={(e) => setData(prev => ({ ...prev, chordChartAcknowledged: e.target.checked }))}
                          className="w-5 h-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-amber-800">I understand chord charts help with CCLI licensing</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <div className="p-6 bg-[var(--muted-wash)] rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--btn-text)]">
                    <Check className="h-4 w-4 text-green-500" />
                    Ready to submit
                  </div>
                  <p className="text-sm text-[var(--btn-text-muted)]">
                    Your song "{data.title}" with {data.writers.length} writer{data.writers.length !== 1 ? "s" : ""} is ready for review.
                  </p>
                </div>
                
                <label className="flex items-center gap-3 p-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.termsAccepted}
                    onChange={(e) => setData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-[var(--border-strong)] text-[var(--btn-text)] focus:ring-[var(--app-focus)] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[var(--btn-text)]">
                    I agree to the{" "}
                    <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="underline">
                      Terms & Conditions
                    </a>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 mt-auto">
            <button
              onClick={goBack}
              className="px-5 py-2.5 text-sm font-medium rounded-xl text-[var(--btn-text)] hover:bg-[var(--muted-wash)] transition-all"
            >
              Back
            </button>
            
            {step === "review" ? (
              <button
                onClick={submit}
                disabled={!canAdvance() || isSubmitting}
                className="px-6 py-2.5 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Song"}
              </button>
            ) : (
              <button
                onClick={advanceStep}
                disabled={!canAdvance()}
                className="px-6 py-2.5 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Document Card */}
        <div className={cn(
          "border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[var(--card-bg)] overflow-y-auto",
          isMobile ? "h-64" : "w-96"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-[var(--btn-text)]">Song Registration</h2>
              <Music className="h-4 w-4 text-[var(--btn-text-muted)]" />
            </div>

            {/* Title */}
            <DocumentField
              label="Title"
              value={data.title}
              filled={!!data.title}
              onEdit={() => setEditingField("title")}
            />

            {/* Type */}
            {(data.type || data.originalWork) && (
              <DocumentField
                label="Type"
                value={data.type === "public_domain" ? `Public Domain (${data.originalWork})` : data.type || "Original"}
                filled={!!data.type}
              />
            )}

            {/* Writers */}
            <div className="py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--btn-text-muted)]">Writers</span>
                {data.writers.length > 0 && (
                  <button
                    onClick={() => setEditingField("writers")}
                    className="p-1 rounded hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)]"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                )}
              </div>
              {data.writers.length > 0 ? (
                <div className="space-y-1.5">
                  {data.writers.map((w) => (
                    <div key={w.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--btn-text)]">{w.name}</span>
                        {w.fromDatabase && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">
                            {w.pro}
                          </span>
                        )}
                      </div>
                      <span className="text-[var(--btn-text-muted)] tabular-nums">{w.split}%</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[var(--btn-text-muted)]">Total</span>
                    <span className={cn(
                      "font-medium tabular-nums",
                      Math.abs(data.writers.reduce((s, w) => s + w.split, 0) - 100) < 0.01 ? "text-green-600" : "text-amber-600"
                    )}>
                      {data.writers.reduce((s, w) => s + w.split, 0)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-4 w-32 bg-[var(--muted-wash)] rounded animate-pulse" />
              )}
            </div>

            {/* Year */}
            <DocumentField
              label="Year"
              value={data.year}
              filled={!!data.year}
            />

            {/* Status */}
            <DocumentField
              label="Released"
              value={data.released === null ? "" : data.released ? "Yes" : "Not yet"}
              filled={data.released !== null}
            />

            {/* Lyrics */}
            <DocumentField
              label="Lyrics"
              value={data.type === "instrumental" ? "Instrumental" : data.lyricsConfirmed ? "Confirmed" : data.lyrics ? "Pending confirmation" : ""}
              filled={data.type === "instrumental" || data.lyricsConfirmed}
            />

            {/* Chord Chart */}
            <DocumentField
              label="Chord Chart"
              value={data.hasChordChart === null ? "" : data.hasChordChart ? "Provided" : "Not provided"}
              filled={data.hasChordChart !== null}
            />
          </div>
        </div>
      </div>

      {/* Writer Edit Modal */}
      {editingField === "writers" && (
        <WriterEditModal
          writers={data.writers}
          onSave={(writers) => {
            setData(prev => ({ ...prev, writers }));
            setEditingField(null);
          }}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function DocumentField({ label, value, filled, onEdit }: { label: string; value: string; filled: boolean; onEdit?: () => void }) {
  return (
    <div className="py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
      <div>
        <span className="text-xs text-[var(--btn-text-muted)] block mb-0.5">{label}</span>
        {value ? (
          <span className="text-sm text-[var(--btn-text)]">{value}</span>
        ) : (
          <div className="h-4 w-24 bg-[var(--muted-wash)] rounded animate-pulse" />
        )}
      </div>
      {filled && (
        <div className="flex items-center gap-1">
          {onEdit && (
            <button onClick={onEdit} className="p-1 rounded hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)]">
              <Edit3 className="h-3 w-3" />
            </button>
          )}
          <Check className="h-4 w-4 text-green-500" />
        </div>
      )}
    </div>
  );
}

function WriterEditModal({ writers, onSave, onClose }: { writers: Writer[]; onSave: (w: Writer[]) => void; onClose: () => void }) {
  const [local, setLocal] = useState<Writer[]>(writers);
  
  const add = () => setLocal(prev => [...prev, { id: crypto.randomUUID(), name: "", pro: "", ipi: "", split: 0, controlled: false, fromDatabase: false }]);
  const remove = (id: string) => local.length > 1 && setLocal(prev => prev.filter(w => w.id !== id));
  const update = (id: string, updates: Partial<Writer>) => setLocal(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-base font-semibold text-[var(--btn-text)]">Edit Writers</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {local.map((w, i) => (
            <div key={w.id} className="p-4 bg-[var(--muted-wash)] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--btn-text-muted)]">Writer {i + 1}</span>
                {local.length > 1 && (
                  <button onClick={() => remove(w.id)} className="p-1 text-[var(--btn-text-muted)] hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={w.name}
                  onChange={(e) => update(w.id, { name: e.target.value })}
                  placeholder="Name"
                  className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20"
                />
                <input
                  type="number"
                  value={w.split || ""}
                  onChange={(e) => update(w.id, { split: parseFloat(e.target.value) || 0 })}
                  placeholder="Split %"
                  className="h-10 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)]/20"
                />
              </div>
            </div>
          ))}
          
          <button onClick={add} className="w-full py-3 text-sm font-medium text-[var(--btn-text)] border-2 border-dashed border-[var(--border-subtle)] rounded-xl hover:border-[var(--btn-text)]/30 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Add Writer
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 border-t border-[var(--border-subtle)]">
          <span className={cn(
            "text-sm font-medium tabular-nums",
            Math.abs(local.reduce((s, w) => s + w.split, 0) - 100) < 0.01 ? "text-green-600" : "text-amber-600"
          )}>
            Total: {local.reduce((s, w) => s + w.split, 0)}%
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--btn-text)] hover:bg-[var(--muted-wash)]">
              Cancel
            </button>
            <button onClick={() => onSave(local)} className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--btn-text)] text-white hover:opacity-90">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
