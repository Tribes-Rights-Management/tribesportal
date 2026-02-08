import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Plus, Trash2, HelpCircle, Upload, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ═══════════════════════════════════════════════════════════════════════════════
// ALGOLIA CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const ALGOLIA_APP_ID = "8WVEYVACJ3";
const ALGOLIA_SEARCH_KEY = "00c22202043b8d20f009257782838d48";
const ALGOLIA_INDEX = "writers";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PublisherEntry {
  id: string;
  publisher_id: string | null;
  name: string;
  pro: string;
  share: number;
  tribes_administered: boolean;
}

interface Writer {
  id: string;
  name: string;
  pro: string;
  ipi: string;
  split: number;
  credit: "lyrics" | "music" | "both" | "";
  fromDatabase: boolean;
  writer_id: string | null;
  publishers: PublisherEntry[];
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



const US_PROS = ["ASCAP", "BMI", "SESAC", "GMR"];

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

const SECTION_HEADINGS = ['Verse', 'Chorus', 'Pre-Chorus', 'Bridge', 'Intro', 'Outro', 'Tag', 'Interlude', 'Refrain', 'Ending', 'Vamp', 'Rap', 'Spoken Words', 'Mid-Section', 'Post-Chorus', 'Descant', 'Ostinato Refrain'];

interface ParsedSection {
  id: string;
  type: string;
  lyrics: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const newPublisher = (): PublisherEntry => ({
  id: crypto.randomUUID(),
  publisher_id: null,
  name: "",
  pro: "",
  share: 0,
  tribes_administered: false,
});

const newWriter = (): Writer => ({
  id: crypto.randomUUID(),
  name: "",
  pro: "",
  ipi: "",
  split: 0,
  credit: "",
  fromDatabase: false,
  writer_id: null,
  publishers: [newPublisher()],
});

const formatLyricsForDisplay = (lyrics: string): string => {
  const lines = lyrics.split('\n');
  const formatted: string[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const isHeading = SECTION_HEADINGS.some(heading => 
      trimmedLine.toLowerCase() === heading.toLowerCase() ||
      trimmedLine.toLowerCase().startsWith(heading.toLowerCase() + ' ')
    );
    
    if (isHeading && index > 0 && formatted[formatted.length - 1]?.trim() !== '') {
      formatted.push('');
    }
    formatted.push(line);
  });
  
  return formatted.join('\n');
};

const parseLyricsIntoSections = (fullLyrics: string): ParsedSection[] => {
  const lines = fullLyrics.split('\n');
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    const matchedHeading = SECTION_HEADINGS.find(heading => 
      trimmedLine.toLowerCase() === heading.toLowerCase() ||
      !!trimmedLine.toLowerCase().match(new RegExp(`^${heading.toLowerCase()}\\s*\\d*$`))
    );
    
    if (matchedHeading || SECTION_HEADINGS.some(h => trimmedLine.toLowerCase().startsWith(h.toLowerCase() + ' '))) {
      if (currentSection && currentSection.lyrics.trim()) {
        sections.push(currentSection);
      }
      currentSection = {
        id: crypto.randomUUID(),
        type: trimmedLine,
        lyrics: ''
      };
    } else if (currentSection) {
      currentSection.lyrics += (currentSection.lyrics ? '\n' : '') + line;
    } else if (trimmedLine) {
      currentSection = {
        id: crypto.randomUUID(),
        type: 'Verse',
        lyrics: line
      };
    }
  });
  
  if (currentSection && currentSection.lyrics.trim()) {
    sections.push(currentSection);
  }
  
  return sections;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SongSubmitPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<FlowStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submittedSongId, setSubmittedSongId] = useState<string | null>(null);
  const [writerSearchResults, setWriterSearchResults] = useState<Record<string, any[]>>({});
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [showParsedPreview, setShowParsedPreview] = useState(false);
  const [activeWriterSearch, setActiveWriterSearch] = useState<string | null>(null);

  // Publisher search state
  const [publisherSearchResults, setPublisherSearchResults] = useState<Record<string, any[]>>({});
  const [activePublisherSearch, setActivePublisherSearch] = useState<string | null>(null);

  // Tribes entities for auto-resolution
  const [tribesEntities, setTribesEntities] = useState<Record<string, { id: string; entity_name: string; ipi_number: string }>>({});
  
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
    writers: [newWriter()],
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

  // ── Fetch Tribes entities on mount ────────────────────────
  useEffect(() => {
    const fetchTribesEntities = async () => {
      const { data } = await (supabase as any)
        .from("tribes_entities")
        .select("id, pro, entity_name, ipi_number")
        .eq("is_active", true);

      const map: Record<string, any> = {};
      (data || []).forEach((e: any) => { map[e.pro] = e; });
      setTribesEntities(map);
    };
    fetchTribesEntities();
  }, []);

  // ── Writer management ─────────────────────────────────────
  const addWriter = () => {
    setData(prev => ({
      ...prev,
      writers: [...prev.writers, newWriter()]
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

  // ── Algolia writer search ─────────────────────────────────
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
      const respData = await response.json();
      setWriterSearchResults(prev => ({ ...prev, [writerId]: respData.hits || [] }));
    } catch (error) {
      console.error("Writer search error:", error);
    }
  };

  const selectWriterFromDatabase = async (writerId: string, hit: any) => {
    // Look up writer UUID from writers table
    let writerDbId: string | null = null;
    try {
      const { data: writerRecord } = await supabase
        .from("writers")
        .select("id")
        .eq("name", hit.name)
        .maybeSingle();
      writerDbId = writerRecord?.id || null;
    } catch (err) {
      console.error("Writer lookup error:", err);
    }

    updateWriter(writerId, {
      name: hit.name,
      pro: hit.pro || "",
      ipi: hit.ipi_number || "",
      fromDatabase: true,
      writer_id: writerDbId,
    });
    setWriterSearchResults(prev => ({ ...prev, [writerId]: [] }));
    setActiveWriterSearch(null);
  };

  // ── Publisher search and management ───────────────────────
  const searchPublishers = async (query: string, pubId: string) => {
    if (!query.trim() || query.length < 2) {
      setPublisherSearchResults(prev => ({ ...prev, [pubId]: [] }));
      return;
    }
    const { data } = await supabase
      .from("publishers")
      .select("id, name, pro")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .limit(8);
    setPublisherSearchResults(prev => ({ ...prev, [pubId]: data || [] }));
  };

  const selectPublisher = (writerId: string, pubId: string, result: any, writerPro: string) => {
    updatePublisher(writerId, pubId, {
      publisher_id: result.id,
      name: result.name,
      pro: result.pro || "",
    });
    setPublisherSearchResults(prev => ({ ...prev, [pubId]: [] }));
    setActivePublisherSearch(null);

    // PRO mismatch warning for US PROs
    const publisherPro = result.pro || "";
    if (US_PROS.includes(writerPro) && US_PROS.includes(publisherPro) && writerPro !== publisherPro) {
      toast.warning(`PRO mismatch: ${writerPro} writer with ${publisherPro} publisher`);
    }
  };

  const updatePublisher = (writerId: string, pubId: string, updates: Partial<PublisherEntry>) => {
    setData(prev => ({
      ...prev,
      writers: prev.writers.map(w =>
        w.id === writerId
          ? { ...w, publishers: w.publishers.map(p => p.id === pubId ? { ...p, ...updates } : p) }
          : w
      ),
    }));
  };

  const addPublisher = (writerId: string) => {
    setData(prev => ({
      ...prev,
      writers: prev.writers.map(w =>
        w.id === writerId
          ? { ...w, publishers: [...w.publishers, newPublisher()] }
          : w
      ),
    }));
  };

  const removePublisher = (writerId: string, pubId: string) => {
    setData(prev => ({
      ...prev,
      writers: prev.writers.map(w =>
        w.id === writerId
          ? { ...w, publishers: w.publishers.filter(p => p.id !== pubId) }
          : w
      ),
    }));
  };

  // ── Lyric section management ──────────────────────────────
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

  // ── Validation ────────────────────────────────────────────
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
          data.writers.every(w => w.name && w.split > 0 && w.credit) &&
          Math.abs(totalSplit - 100) < 0.01;
        // Check each writer has at least one publisher with a publisher_id
        const hasPublishers = data.writers.every(w => 
          w.publishers.some(p => p.publisher_id)
        );
        return hasTitle && hasAltHandled && hasType && hasOriginal && data.releaseStatus !== null && hasYear && hasWriters && hasPublishers;
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
    if (step === 2 && data.lyricsEntryMode === 'paste' && data.lyricsFull.trim() && !showParsedPreview) {
      const sections = parseLyricsIntoSections(data.lyricsFull);
      if (sections.length > 0) {
        setParsedSections(sections);
        setShowParsedPreview(true);
        return;
      }
    }
    if (step < 5 && canAdvanceStep()) setStep((step + 1) as FlowStep);
  };

  const confirmParsedSections = () => {
    const convertedSections: LyricSection[] = parsedSections.map(s => ({
      id: s.id,
      type: s.type.toLowerCase().replace(/\s+\d*$/, '').replace(/[- ]/g, '-') as LyricSection["type"],
      content: s.lyrics.trim()
    }));
    setData(prev => ({ ...prev, lyricsSections: convertedSections }));
    setShowParsedPreview(false);
    setStep(3);
  };

  const goToPrevStep = () => {
    if (step > 1) setStep((step - 1) as FlowStep);
    else navigate("/rights/catalog");
  };

  // ── Submit ────────────────────────────────────────────────
  const submit = async () => {
    // Validate writer total
    const writerTotal = data.writers.reduce((sum, w) => sum + (w.split || 0), 0);
    if (writerTotal !== 100) {
      toast.error(`Writer shares must total exactly 100.00% (currently ${writerTotal.toFixed(2)}%)`);
      return;
    }

    // Check each writer has at least one publisher
    for (const writer of data.writers) {
      if (!writer.publishers.some(p => p.publisher_id)) {
        toast.error(`${writer.name || "Each writer"} must have at least one publisher`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const year = data.releaseStatus === "no" ? data.creationYear : data.publicationYear;
      const lyrics = data.lyricsEntryMode === "paste" ? data.lyricsFull : data.lyricsSections.map(s => `[${s.type?.toUpperCase()}]\n${s.content}`).join("\n\n");
      
      // 1. Create the song — NO writers in metadata
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
          // NO writers here — they go to song_writers table
        },
        is_active: false,
      };
      const { data: insertedData, error } = await supabase.from("songs").insert(songPayload as any).select("id").single();
      
      if (error) throw error;
      const newSongId = insertedData?.id;
      if (!newSongId) throw new Error("No song ID returned");

      // 2. Save writers to song_writers table
      const writerRecords = data.writers
        .filter(w => w.writer_id && w.name.trim())
        .map(w => ({
          song_id: newSongId,
          writer_id: w.writer_id!,
          share: w.split,
          credit: w.credit || "both",
        }));

      let insertedWriters: { id: string; writer_id: string }[] = [];
      if (writerRecords.length > 0) {
        const { data: swData, error: writerError } = await (supabase as any)
          .from("song_writers")
          .insert(writerRecords)
          .select("id, writer_id");

        if (writerError) {
          console.error("Writer save error:", JSON.stringify(writerError));
          toast.error("Failed to save writers: " + (writerError.message || "Unknown error"));
          return;
        }
        insertedWriters = swData || [];
      }

      // 3. Build writer_id → song_writer_id map
      const songWriterMap = new Map(
        insertedWriters.map(sw => [sw.writer_id, sw.id])
      );

      // 4. Save ownership (publishers + Tribes administration)
      const ownershipRecords: any[] = [];
      for (const writer of data.writers) {
        for (const pub of writer.publishers) {
          if (!pub.publisher_id) continue;

          const songWriterId = writer.writer_id ? songWriterMap.get(writer.writer_id) : null;
          const tribesEntity = pub.tribes_administered && pub.pro
            ? tribesEntities[pub.pro]
            : null;

          ownershipRecords.push({
            song_id: newSongId,
            song_writer_id: songWriterId || null,
            publisher_id: pub.publisher_id,
            ownership_percentage: pub.share || writer.split,
            tribes_administered: pub.tribes_administered,
            administrator_entity_id: tribesEntity?.id || null,
          });
        }
      }

      if (ownershipRecords.length > 0) {
        const { error: ownershipError } = await (supabase as any)
          .from("song_ownership")
          .insert(ownershipRecords);

        if (ownershipError) {
          console.error("Ownership save error:", JSON.stringify(ownershipError));
          toast.error("Failed to save ownership: " + (ownershipError.message || "Unknown error"));
          return;
        }
      }

      setSubmittedSongId(newSongId);
      setSubmissionComplete(true);
      window.scrollTo(0, 0);
       
      // Fire and forget: send confirmation emails
      sendConfirmationEmails(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionComplete(false);
    setSubmittedSongId(null);
    setStep(1);
    setParsedSections([]);
    setShowParsedPreview(false);
    setData({
      title: "",
      hasAlternateTitle: null,
      alternateTitle: "",
      language: "English",
      songType: "",
      originalWorkTitle: "",
      releaseStatus: null,
      publicationYear: "",
      creationYear: "",
      writers: [newWriter()],
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
  };

  const totalSplit = data.writers.reduce((s, w) => s + w.split, 0);
  const splitValid = Math.abs(totalSplit - 100) < 0.01;

   // Fire and forget email sending
   const sendConfirmationEmails = async (songData: SongData) => {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user?.email) return;
 
       const { data: adminUsers } = await supabase
         .from("company_users")
         .select("user_id")
         .eq("role", "super_admin")
         .is("deactivated_at", null);
 
       const adminEmails: string[] = [];
       if (adminUsers && adminUsers.length > 0) {
         const { data: profiles } = await supabase
           .from("user_profiles")
           .select("email")
           .in("user_id", adminUsers.map(a => a.user_id));
         
         if (profiles) {
           adminEmails.push(...profiles.map(p => p.email).filter(Boolean));
         }
       }
 
       const recipients = [...new Set([user.email, ...adminEmails])];
       const writerNames = songData.writers.map(w => w.name).join(" \\ ");
       const songTypeLabel = SONG_TYPES.find(t => t.value === songData.songType)?.label || songData.songType;
       const year = songData.releaseStatus === "no" ? songData.creationYear : songData.publicationYear;
       
       const writersSection = songData.writers.map(w => {
         const creditLabel = w.credit === "both" 
           ? "Wrote the words, Composed the music" 
           : w.credit === "lyrics" 
             ? "Wrote the words" 
             : "Composed the music";
         return `${w.name} — ${creditLabel} — ${w.split}% — ${w.pro}`;
       }).join("\n");
       
       const lyricsText = songData.lyricsEntryMode === "paste" 
         ? songData.lyricsFull 
         : songData.lyricsSections.map(s => `[${s.type?.toUpperCase()}]\n${s.content}`).join("\n\n");
       
       const chordChartStatus = songData.hasChordChart ? "Yes" : "No";
       const copyrightStatus = songData.copyrightStatus === "yes" 
         ? "Yes" 
         : songData.copyrightStatus === "no" 
           ? "No" 
           : "I Don't Know";
       
       const emailBody = `Congratulations! ${songData.title} by ${writerNames} has been successfully submitted to Tribes.
 
 If you did not authorize or approve this change, please email our IP department at publishing@tribesassets.com.
 
 Song Details
 
 Song Title: ${songData.title}
 Song Type: ${songTypeLabel}
 Language: ${songData.language}
 Publication Year: ${year || "Not specified"}
 
 Songwriters:
 ${writersSection}
 
 Lyrics:
 ${lyricsText || "(No lyrics)"}
 
 Chord Chart: ${chordChartStatus}
 Copyright Filed: ${copyrightStatus}`;
 
       supabase.functions.invoke("send-support-email", {
         body: {
           to: recipients,
           subject: "Song Submission Confirmation",
           body: emailBody,
         },
       }).catch((err) => {
         console.error("Failed to send confirmation email:", err);
       });
     } catch (err) {
       console.error("Error preparing confirmation email:", err);
     }
   };
 
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP DEFINITIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const STEPS = [
    { id: 1, label: "Song Info", description: "Title, writers, and details" },
    { id: 2, label: "Lyrics", description: "Song lyrics or instrumental" },
    { id: 3, label: "Chords", description: "Chord chart upload" },
    { id: 4, label: "Copyright", description: "Protection status" },
    { id: 5, label: "Review", description: "Review and submit" },
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
          data.writers.every(w => w.name && w.split > 0 && w.credit) &&
          Math.abs(data.writers.reduce((s, w) => s + w.split, 0) - 100) < 0.01;
        const hasPublishers = data.writers.every(w => w.publishers.some(p => p.publisher_id));
        return hasTitle && hasAltHandled && hasType && hasOriginal && data.releaseStatus !== null && hasYear && hasWriters && hasPublishers;
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
    if (targetStep < step) return true;
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
        <button onClick={() => navigate("/rights/catalog")} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted-wash)] text-[var(--btn-text-muted)] hover:text-[var(--btn-text)]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="ml-3 text-sm font-medium text-[var(--btn-text)]">Add Song</span>
      </header>

      {/* Main Content with Side Stepper */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Side Stepper */}
        {!submissionComplete && (
        <aside className="hidden md:flex w-56 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--topbar-bg)] flex-col pt-6">
          <nav className="flex flex-col">
            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isComplete = isStepComplete(s.id);
              const canNavigate = canNavigateToStep(s.id);
              
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id as FlowStep)}
                  disabled={!canNavigate}
                  className={cn(
                    "flex items-center justify-start gap-3 py-3 text-left transition-colors",
                    isActive && "bg-[var(--muted-wash)]",
                    !isActive && canNavigate && "hover:bg-[var(--muted-wash)]/50",
                    !canNavigate && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ paddingLeft: '24px', paddingRight: '16px' }}
                >
                  <div 
                    className={cn(
                    "rounded-full flex items-center justify-center text-xs font-semibold",
                    isActive && "bg-[var(--btn-text)] text-white",
                    isComplete && !isActive && "bg-success text-white",
                    !isComplete && !isActive && "bg-[var(--border-subtle)] text-[var(--btn-text-muted)]"
                    )}
                    style={{ width: '28px', height: '28px', minWidth: '28px' }}
                  >
                    {isComplete && !isActive ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      s.id
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-[var(--btn-text)]" : "text-[var(--btn-text-muted)]"
                  )}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>
        )}

        {/* Mobile Progress Bar */}
        {!submissionComplete && (
        <div className="md:hidden absolute top-14 left-0 right-0 h-1 bg-[var(--border-subtle)] z-10">
          <div className="h-full bg-[var(--btn-text)] transition-all" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
        )}

        {/* Form Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:pt-8">

          {/* SUCCESS CONFIRMATION PAGE */}
          {submissionComplete ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Success Banner */}
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--btn-text)]">Song Submitted Successfully</h2>
                <p className="text-sm text-[var(--btn-text-muted)] max-w-md mx-auto">
                  Your song has been submitted for review. We've emailed a confirmation to your primary email address. You can track the status of your submission in your catalog.
                </p>
              </div>

              {/* Full Review Receipt - Song Details */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--app-focus)]">Song Details</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--btn-text)]">Song Title</p>
                    <p className="text-sm text-[var(--btn-text-muted)]">{data.title}</p>
                  </div>
                  {data.hasAlternateTitle && data.alternateTitle && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--btn-text)]">Alternate Title</p>
                      <p className="text-sm text-[var(--btn-text-muted)]">{data.alternateTitle}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[var(--btn-text)]">Song Type</p>
                    <p className="text-sm text-[var(--btn-text-muted)]">{SONG_TYPES.find(t => t.value === data.songType)?.label || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--btn-text)]">
                      {data.releaseStatus === 'no' ? 'Creation Year' : 'Publication Year'}
                    </p>
                    <p className="text-sm text-[var(--btn-text-muted)]">
                      {data.releaseStatus === 'no' ? data.creationYear : data.publicationYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--btn-text)]">Registered Songwriters</p>
                    {data.writers.map((w) => (
                      <div key={w.id} className="mt-1">
                        <p className="text-sm text-[var(--btn-text-muted)]">
                          {w.name} ({w.credit === 'both' ? 'Wrote the lyrics, Composed the music' : w.credit === 'lyrics' ? 'Wrote the lyrics' : 'Composed the music'}) — {w.split}%
                        </p>
                        {w.publishers.filter(p => p.publisher_id).map(pub => (
                          <p key={pub.id} className="text-xs text-[var(--btn-text-muted)] ml-4">
                            Publisher: {pub.name} ({pub.pro || "—"}) {pub.tribes_administered ? "— Tribes" : ""}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lyrics Receipt */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--app-focus)]">Lyrics</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-[var(--btn-text)]">Language</p>
                    <p className="text-sm text-[var(--btn-text-muted)]">{data.language}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--btn-text)]">Lyric Sections</p>
                    {data.lyricsSections && data.lyricsSections.length > 0 ? (
                      <div className="mt-2 space-y-3">
                        {data.lyricsSections.map((section, i) => (
                          <div key={section.id || i}>
                            <p className="text-sm font-medium text-[var(--btn-text-muted)] capitalize">{section.type}</p>
                            <pre className="text-sm text-[var(--btn-text-muted)] whitespace-pre-wrap font-sans">{section.content}</pre>
                          </div>
                        ))}
                      </div>
                    ) : data.lyricsFull ? (
                      <pre className="mt-2 text-sm text-[var(--btn-text-muted)] whitespace-pre-wrap font-sans">{data.lyricsFull}</pre>
                    ) : (
                      <p className="text-sm text-[var(--btn-text-muted)] italic">No lyrics entered</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chords Receipt */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--app-focus)]">Chords</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-[var(--btn-text-muted)]">
                    {data.hasChordChart && data.chordChartFile ? data.chordChartFile.name : 'No Chords Entered'}
                  </p>
                </div>
              </div>

              {/* Copyright Receipt */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--app-focus)]">Copyright</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-[var(--btn-text-muted)]">
                    {data.copyrightStatus === 'yes' ? 'Filed for copyright protection' : data.copyrightStatus === 'no' ? (data.wantsCopyrightFiling ? 'Not filed — Tribes to file on behalf' : 'Not filed') : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4 pb-8">
                <button 
                  onClick={() => navigate('/rights/catalog')}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl border border-[var(--border-subtle)] text-[var(--btn-text)] hover:bg-[var(--muted-wash)]"
                >
                  View Catalog
                </button>
                <button 
                  onClick={resetForm}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-[var(--btn-text)] text-white hover:opacity-90"
                >
                  Register Another Song
                </button>
              </div>
            </div>
          ) : (
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
                {data.hasAlternateTitle === true && (
                  <input type="text" value={data.alternateTitle} onChange={(e) => setData(prev => ({ ...prev, alternateTitle: e.target.value }))} placeholder="Enter alternate title" className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--btn-text)]">Language</label>
                <Select value={data.language} onValueChange={(value) => setData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="h-12 px-4 bg-card border border-[var(--border-subtle)] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--btn-text)]">Song Type <span className="text-destructive">*</span></label>
                <select
                  value={data.songType}
                  onChange={(e) => setData(prev => ({ ...prev, songType: e.target.value as SongData["songType"] }))}
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select song type</option>
                  {SONG_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {["public_domain", "derivative", "medley"].includes(data.songType) && (
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-[var(--btn-text)]">Original work title <span className="text-destructive">*</span></label>
                    <input type="text" value={data.originalWorkTitle} onChange={(e) => setData(prev => ({ ...prev, originalWorkTitle: e.target.value }))} placeholder="Enter the original work title" className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--btn-text)]">Has this song been released/recorded? <span className="text-destructive">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {[{ v: "yes" as const, l: "Yes" }, { v: "no" as const, l: "No" }, { v: "youtube_only" as const, l: "YouTube Only" }].map(o => (
                    <button key={o.v} onClick={() => setData(prev => ({ ...prev, releaseStatus: o.v }))} className={cn("px-5 py-2.5 text-sm font-medium rounded-xl border-2", data.releaseStatus === o.v ? "border-[var(--btn-text)] bg-[var(--btn-text)] text-white" : "border-[var(--border-subtle)] text-[var(--btn-text)]")}>
                      {o.l}
                    </button>
                  ))}
                </div>
                {data.releaseStatus === "no" ? (
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-[var(--btn-text)]">Creation Year <span className="text-destructive">*</span></label>
                    <input type="text" value={data.creationYear} onChange={(e) => setData(prev => ({ ...prev, creationYear: e.target.value }))} placeholder="e.g. 2024" className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                  </div>
                ) : data.releaseStatus !== null && (
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-[var(--btn-text)]">First Publication Year <span className="text-destructive">*</span></label>
                    <input type="text" value={data.publicationYear} onChange={(e) => setData(prev => ({ ...prev, publicationYear: e.target.value }))} placeholder="e.g. 2024" className="w-full h-12 px-4 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none" />
                  </div>
                )}
              </div>

              {/* WRITERS SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--btn-text)]">
                    Songwriters <span className="text-destructive">*</span>
                  </label>
                  <span className={cn(
                    "text-sm font-medium",
                    splitValid ? "text-[hsl(var(--success))]" : "text-destructive"
                  )}>
                    Total: {totalSplit.toFixed(2)}%
                  </span>
                </div>
                <div className="space-y-4">
                  {data.writers.map((w, i) => (
                      <div key={w.id} className="p-4 bg-[var(--muted-wash)] rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-[var(--btn-text-muted)]">Writer {i + 1}</span>
                          {data.writers.length > 1 && <button onClick={() => removeWriter(w.id)} className="p-1 text-[var(--btn-text-muted)] hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                        
                        <div className="relative">
                          <input
                            type="text"
                            value={w.name}
                            onChange={(e) => {
                              updateWriter(w.id, { name: e.target.value, fromDatabase: false, writer_id: null });
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
                            <div className="absolute z-20 w-full mt-1 bg-card border border-[var(--border-subtle)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                        
                        {/* Show fields only when not actively searching */}
                        {w.name && activeWriterSearch !== w.id && (
                          <>
                            {/* PRO + IPI display (read-only, shown after writer is selected) */}
                            {w.fromDatabase && (
                              <div className="flex items-center gap-3 text-[12px] text-[var(--btn-text-muted)]">
                                {w.pro && (
                                  <span className="bg-[var(--muted-wash)] border border-[var(--border-subtle)] px-2 py-0.5 rounded font-medium text-[11px]">{w.pro}</span>
                                )}
                                {w.ipi && (
                                  <span className="font-mono text-[11px]">{w.ipi}</span>
                                )}
                              </div>
                            )}

                            {/* Split + Credit row */}
                            <div className="flex items-end gap-3">
                              <div className="w-[120px]">
                                <label className="block text-[11px] uppercase tracking-wider text-[var(--btn-text-muted)] mb-1">Split % *</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={w.split || ""}
                                  onChange={(e) => updateWriter(w.id, { split: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  className="w-full h-9 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                              </div>
                              <div className="w-[160px]">
                                <label className="block text-[11px] uppercase tracking-wider text-[var(--btn-text-muted)] mb-1">Credit *</label>
                                <Select value={w.credit} onValueChange={(value) => updateWriter(w.id, { credit: value as Writer["credit"] })}>
                                  <SelectTrigger className="h-9 px-3 bg-card border border-[var(--border-subtle)] rounded-lg">
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover">
                                    <SelectItem value="both">Writer & Composer</SelectItem>
                                    <SelectItem value="lyrics">Writer</SelectItem>
                                    <SelectItem value="music">Composer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Publisher section — subtle card */}
                            <div className="bg-[var(--muted-wash)]/50 border border-[var(--border-subtle)]/40 rounded-lg p-3 mt-1">
                              <span className="text-[11px] uppercase tracking-wider text-[var(--btn-text-muted)] font-medium block mb-2">
                                Publisher
                              </span>
                              
                              {w.publishers.map((pub) => (
                                <div key={pub.id} className="mb-2 last:mb-0">
                                  <div className="flex items-center gap-3">
                                    {/* Publisher typeahead */}
                                    <div className="flex-1 relative">
                                      <input
                                        type="text"
                                        value={pub.name}
                                        onChange={(e) => {
                                          updatePublisher(w.id, pub.id, { name: e.target.value, publisher_id: null });
                                          searchPublishers(e.target.value, pub.id);
                                          setActivePublisherSearch(pub.id);
                                        }}
                                        onFocus={() => setActivePublisherSearch(pub.id)}
                                        onBlur={() => setTimeout(() => setActivePublisherSearch(null), 200)}
                                        placeholder="Search publishers..."
                                        className="w-full h-9 px-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                                      />
                                      
                                      {/* Publisher dropdown results */}
                                      {activePublisherSearch === pub.id && publisherSearchResults[pub.id]?.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 bg-card border border-[var(--border-subtle)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                          {publisherSearchResults[pub.id].map((result: any) => (
                                            <button
                                              key={result.id}
                                              type="button"
                                              onMouseDown={(e) => e.preventDefault()}
                                              onClick={() => selectPublisher(w.id, pub.id, result, w.pro)}
                                              className="w-full px-3 py-2 text-left hover:bg-[var(--muted-wash)] border-b border-[var(--border-subtle)] last:border-b-0 flex items-center justify-between"
                                            >
                                              <span className="text-[13px] text-[var(--btn-text)]">{result.name}</span>
                                              <span className="text-[11px] text-[var(--btn-text-muted)]">{result.pro || "—"}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* PRO badge (read-only) */}
                                    <span className="text-[11px] text-[var(--btn-text-muted)] bg-[var(--muted-wash)] border border-[var(--border-subtle)] px-2 py-1 rounded min-w-[50px] text-center shrink-0">
                                      {pub.pro || "—"}
                                    </span>
                                    
                                    {/* Administrator toggle */}
                                    <div className="w-[120px] shrink-0">
                                      <select
                                        value={pub.tribes_administered ? "tribes" : "other"}
                                        onChange={(e) => {
                                          updatePublisher(w.id, pub.id, { tribes_administered: e.target.value === "tribes" });
                                        }}
                                        className="w-full h-9 px-2 text-sm bg-card border border-border rounded-lg"
                                      >
                                        <option value="other">Other</option>
                                        <option value="tribes">Tribes</option>
                                      </select>
                                    </div>
                                    
                                    {/* Show resolved Tribes entity inline */}
                                    {pub.tribes_administered && pub.pro && tribesEntities[pub.pro] && (
                                      <span className="text-[11px] text-muted-foreground italic whitespace-nowrap shrink-0">
                                        → {tribesEntities[pub.pro].entity_name}
                                      </span>
                                    )}
                                    
                                    {/* Remove publisher button */}
                                    {w.publishers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removePublisher(w.id, pub.id)}
                                        className="text-[var(--btn-text-muted)] hover:text-destructive p-1 shrink-0"
                                      >
                                        <span className="text-sm">×</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}

                              
                              
                              {/* Add another publisher */}
                              <button
                                type="button"
                                onClick={() => addPublisher(w.id)}
                                className="text-[11px] uppercase tracking-wider text-[var(--btn-text-muted)] hover:text-[var(--btn-text)] mt-2"
                              >
                                + Add Publisher
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  )}
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
              
              {/* Parsed Sections Preview */}
              {showParsedPreview && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--btn-text)]">Review Parsed Sections</h3>
                    <p className="text-sm text-[var(--btn-text-muted)]">{parsedSections.length} sections detected</p>
                  </div>
                  
                  <p className="text-sm text-[var(--btn-text-muted)]">
                    We've automatically separated your lyrics into sections. Review and edit if needed.
                  </p>
                  
                  <div className="space-y-4">
                    {parsedSections.map((section, index) => (
                      <div key={section.id} className="p-4 bg-card border border-[var(--border-subtle)] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[var(--btn-text-muted)]">Section {index + 1}</span>
                          <button 
                            type="button"
                            onClick={() => setParsedSections(prev => prev.filter(s => s.id !== section.id))}
                            className="text-xs text-[var(--btn-text-muted)] hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <Select 
                          value={section.type} 
                          onValueChange={(value) => setParsedSections(prev => 
                            prev.map(s => s.id === section.id ? { ...s, type: value } : s)
                          )}
                        >
                          <SelectTrigger className="w-48 h-10 bg-card border border-[var(--border-subtle)] rounded-lg">
                            <SelectValue placeholder="Section type" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {SECTION_HEADINGS.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <textarea
                          value={section.lyrics}
                          onChange={(e) => setParsedSections(prev => 
                            prev.map(s => s.id === section.id ? { ...s, lyrics: e.target.value } : s)
                          )}
                          rows={4}
                          className="w-full px-4 py-3 text-sm bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl focus:outline-none resize-y font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Regular Lyrics Entry */}
              {!showParsedPreview && data.songType !== "instrumental" && (
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
                        <p className="text-xs text-[var(--btn-text-muted)] mt-2">Section headings will be automatically separated with blank lines.</p>
                      </div>
                      <textarea 
                        value={data.lyricsFull} 
                        onChange={(e) => setData(prev => ({ ...prev, lyricsFull: e.target.value }))} 
                        onBlur={(e) => {
                          const formatted = formatLyricsForDisplay(e.target.value);
                          if (formatted !== e.target.value) {
                            setData(prev => ({ ...prev, lyricsFull: formatted }));
                          }
                        }}
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
                            <Select value={s.type} onValueChange={(value) => updateLyricSection(s.id, { type: value as LyricSection["type"] })}>
                              <SelectTrigger className="h-10 px-3 bg-card border border-[var(--border-subtle)] rounded-lg w-40">
                                <SelectValue placeholder="Select section..." />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                {LYRIC_SECTION_TYPES.map(t => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setData(prev => ({ ...prev, chordChartFile: e.target.files?.[0] || null }))} className="hidden" id="chord-upload" />
                    <label htmlFor="chord-upload" className="text-sm text-[var(--btn-text)] cursor-pointer hover:underline">Click to upload</label>
                    <p className="text-xs text-[var(--btn-text-muted)] mt-2">PDF, DOC, or DOCX</p>
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
            <div className="space-y-6">
              {/* Song Details */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[var(--muted-wash)] border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--btn-text)]">Song Details</h3>
                  <button onClick={() => goToStep(1)} className="text-xs text-[var(--app-focus)] hover:underline">Edit</button>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--btn-text-muted)]">Title</span>
                    <span className="text-[var(--btn-text)] font-medium">{data.title}</span>
                  </div>
                  {data.alternateTitle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--btn-text-muted)]">Alternate Title</span>
                      <span className="text-[var(--btn-text)] font-medium">{data.alternateTitle}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--btn-text-muted)]">Language</span>
                    <span className="text-[var(--btn-text)] font-medium">{data.language || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--btn-text-muted)]">Song Type</span>
                    <span className="text-[var(--btn-text)] font-medium capitalize">{data.songType.replace("_", " ") || "Not specified"}</span>
                  </div>
                  {data.publicationYear && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--btn-text-muted)]">First Publication Year</span>
                      <span className="text-[var(--btn-text)] font-medium">{data.publicationYear}</span>
                    </div>
                  )}
                  {data.creationYear && !data.publicationYear && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--btn-text-muted)]">Creation Year</span>
                      <span className="text-[var(--btn-text)] font-medium">{data.creationYear}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--btn-text-muted)]">Released/Recorded</span>
                    <span className="text-[var(--btn-text)] font-medium capitalize">{data.releaseStatus === "yes" ? "Yes" : data.releaseStatus === "no" ? "No" : data.releaseStatus === "youtube_only" ? "YouTube Only" : "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Writers + Publishers */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[var(--muted-wash)] border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--btn-text)]">Writers & Publishers</h3>
                  <button onClick={() => goToStep(1)} className="text-xs text-[var(--app-focus)] hover:underline">Edit</button>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {data.writers.map((w) => (
                    <div key={w.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--btn-text)] font-medium">{w.name}</span>
                        <span className="text-[var(--btn-text-muted)]">
                          {w.pro} · {w.split}% · {w.credit === "both" ? "Lyrics & Music" : w.credit === "lyrics" ? "Lyrics" : w.credit === "music" ? "Music" : "—"}
                        </span>
                      </div>
                      {w.publishers.filter(p => p.publisher_id).map(pub => (
                        <div key={pub.id} className="flex justify-between text-xs ml-4 text-[var(--btn-text-muted)]">
                          <span>Publisher: {pub.name} ({pub.pro || "—"})</span>
                          <span>{pub.tribes_administered ? "Tribes" : "Other"}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t border-[var(--border-subtle)] pt-3">
                    <span className="text-[var(--btn-text-muted)]">Total Split</span>
                    <span className={cn("font-semibold", splitValid ? "text-success" : "text-warning")}>
                      {totalSplit.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Lyrics */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[var(--muted-wash)] border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--btn-text)]">Lyrics</h3>
                  <button onClick={() => goToStep(2)} className="text-xs text-[var(--app-focus)] hover:underline">Edit</button>
                </div>
                <div className="px-5 py-4">
                  {data.songType === "instrumental" ? (
                    <p className="text-sm text-[var(--btn-text-muted)] italic">Instrumental (no lyrics)</p>
                  ) : data.lyricsFull ? (
                    <pre className="text-sm text-[var(--btn-text)] whitespace-pre-wrap font-sans">{data.lyricsFull.substring(0, 500)}{data.lyricsFull.length > 500 ? '...' : ''}</pre>
                  ) : data.lyricsSections.length > 0 ? (
                    <div className="space-y-2">
                      {data.lyricsSections.slice(0, 3).map((section) => (
                        <div key={section.id}>
                          <span className="text-xs font-semibold text-[var(--btn-text-muted)] uppercase">{section.type || "Section"}</span>
                          <p className="text-sm text-[var(--btn-text)]">{section.content.substring(0, 100)}{section.content.length > 100 ? '...' : ''}</p>
                        </div>
                      ))}
                      {data.lyricsSections.length > 3 && (
                        <p className="text-xs text-[var(--btn-text-muted)]">+ {data.lyricsSections.length - 3} more sections</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--btn-text-muted)] italic">No lyrics provided</p>
                  )}
                </div>
              </div>

              {/* Chords */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[var(--muted-wash)] border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--btn-text)]">Chords</h3>
                  <button onClick={() => goToStep(3)} className="text-xs text-[var(--app-focus)] hover:underline">Edit</button>
                </div>
                <div className="px-5 py-4">
                  {data.chordChartFile ? (
                    <p className="text-sm text-[var(--btn-text)]">Chord chart uploaded: {data.chordChartFile.name}</p>
                  ) : data.hasChordChart === false ? (
                    <p className="text-sm text-[var(--btn-text-muted)] italic">No chord chart (acknowledged)</p>
                  ) : (
                    <p className="text-sm text-[var(--btn-text-muted)] italic">No chords provided</p>
                  )}
                </div>
              </div>

              {/* Copyright */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[var(--muted-wash)] border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--btn-text)]">Copyright</h3>
                  <button onClick={() => goToStep(4)} className="text-xs text-[var(--app-focus)] hover:underline">Edit</button>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--btn-text-muted)]">Copyright Registered</span>
                    <span className="text-[var(--btn-text)] font-medium capitalize">{data.copyrightStatus === "yes" ? "Yes" : data.copyrightStatus === "no" ? "No" : data.copyrightStatus === "unknown" ? "Unknown" : "Not specified"}</span>
                  </div>
                  {data.copyrightStatus === "no" && data.wantsCopyrightFiling !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--btn-text-muted)]">Copyright Filing Requested</span>
                      <span className="text-[var(--btn-text)] font-medium">{data.wantsCopyrightFiling ? "Yes" : "No"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-card border border-[var(--border-subtle)] rounded-lg p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.termsAccepted} 
                    onChange={(e) => setData(prev => ({ ...prev, termsAccepted: e.target.checked }))} 
                    className="w-[18px] h-[18px] mt-0.5 rounded-none" 
                    style={{ boxShadow: 'inset 0 0 0 1.5px #888', border: 'none' }}
                  />
                  <span className="text-sm text-[var(--btn-text)]">
                    I agree to the <a href="https://tribesrightsmanagement.com" target="_blank" rel="noopener noreferrer" className="text-[var(--app-focus)] hover:underline">Tribes Rights Management LLC Terms & Conditions</a>
                  </span>
                </label>
              </div>
            </div>
          )}

            </div>
          )}
          </div>

          {/* Footer Actions */}
          {!submissionComplete && (
            <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--topbar-bg)] p-4 sm:px-6">
              <div className="w-full flex items-center justify-between">
                {step > 1 ? (
                  <button 
                    onClick={goToPrevStep} 
                    className="px-5 py-2.5 text-sm font-medium rounded-lg text-[var(--btn-text)] hover:bg-[var(--muted-wash)]"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {step === 5 ? (
                  <button 
                    onClick={submit} 
                    disabled={!canAdvanceStep() || isSubmitting} 
                    className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Song'} <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    onClick={goToNextStep} 
                    disabled={!canAdvanceStep()} 
                    className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--btn-text)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
