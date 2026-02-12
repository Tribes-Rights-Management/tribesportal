// ============================================================
// Song Schema Contract — TypeScript Types
// ============================================================
// This file is the frontend source of truth for all song-related
// data structures. It mirrors schema-contract.md exactly.
//
// RULES:
// 1. All keys are snake_case — no camelCase, no exceptions
// 2. Every field has ONE name — no aliases, no fallbacks
// 3. If you need a new field, add it here FIRST, then implement
// 4. Queue JSONB, songs.metadata, and UI all reference these types
// ============================================================

// ----- Submission Form → song_queue.submitted_data -----

export interface SongSubmissionData {
  // Required
  title: string;
  writers: QueueWriter[];

  // Song details
  language?: string;
  song_type?: SongType;
  publication_year?: string;
  copyright_status?: CopyrightStatus;
  release_status?: ReleaseStatus;
  original_work_title?: string | null;
  wants_copyright_filing?: boolean | null;
  alternate_titles?: string[] | null;

  // Lyrics
  lyrics?: string | null;
  lyrics_sections?: LyricsSection[] | null;
  lyrics_confirmed?: boolean;

  // Chord chart
  chord_chart_path?: string | null;
  chord_chart_file?: string | null;
  has_chord_chart?: boolean;

  // Creation (informational only, not used in approval)
  creation_year?: string | null;
}

export interface QueueWriter {
  writer_id: string;
  name: string;
  pro?: string | null;
  ipi?: string | null;
  split: number;
  credit?: WriterCredit;
  tribes_administered?: boolean;

  // Only present in legacy submissions without deals
  publishers?: QueuePublisher[];
}

export interface QueuePublisher {
  publisher_id: string;
  name: string;
  pro?: string | null;
  ipi?: string | null;
  share: number;
  tribes_administered?: boolean;
}

export interface LyricsSection {
  id: string;
  type: LyricsSectionType;
  content: string;
}

// ----- songs.metadata JSONB -----

export interface SongMetadata {
  song_type: SongType;
  publication_year?: string | null;
  copyright_status?: string | null;
  release_status?: string | null;
  original_work_title?: string | null;
  wants_copyright_filing?: string | null;
  lyrics?: string | null;
  lyrics_sections?: LyricsSection[] | null;
  lyrics_confirmed?: boolean | null;
  chord_chart_path?: string | null;
  chord_chart_file?: string | null;
  has_chord_chart?: boolean | null;
}

// ----- Database row types -----

export interface Song {
  id: string;
  title: string;
  alternate_titles?: string[] | null;
  iswc?: string | null;
  language?: string | null;
  genre?: string | null;
  duration_seconds?: number | null;
  release_date?: string | null;
  is_active: boolean;
  metadata: SongMetadata;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  published_by?: string | null;
  source_queue_id?: string | null;
  ccli_song_id?: string | null;
  song_number?: number | null;
}

export interface SongQueueItem {
  id: string;
  client_account_id?: string | null;
  submitted_data: SongSubmissionData;
  current_data: SongSubmissionData;
  status: QueueStatus;
  submitted_by: string;
  submitted_at: string;
  revision_request?: string | null;
  revision_requested_at?: string | null;
  revision_requested_by?: string | null;
  revision_submitted_at?: string | null;
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  approved_song_id?: string | null;
  updated_at: string;
  submission_number?: number | null;
  deal_id?: string | null;
}

export interface SongWriter {
  id: string;
  song_id: string;
  writer_id: string;
  share: number;
  credit?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tribes_administered: boolean;
  deal_id?: string | null;
}

export interface SongOwnership {
  id: string;
  song_id: string;
  publisher_id: string;
  administrator_id?: string | null;
  ownership_percentage: number;
  territory?: string | null;
  notes?: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  controlled: boolean;
  song_writer_id?: string | null;
  tribes_administered: boolean;
  administrator_entity_id?: string | null;
}

// ----- Enums -----

export type SongType = 'original' | 'arrangement' | 'public_domain';

export type CopyrightStatus = 'unknown' | 'registered' | 'pending';

export type ReleaseStatus = 'yes' | 'no';

export type WriterCredit = 'writer' | 'composer' | 'both';

export type LyricsSectionType =
  | 'verse'
  | 'chorus'
  | 'bridge'
  | 'pre_chorus'
  | 'outro'
  | 'intro'
  | 'interlude'
  | 'tag';

export type QueueStatus =
  | 'pending'
  | 'submitted'
  | 'in_review'
  | 'needs_revision'
  | 'approved'
  | 'rejected';

// ----- Helpers -----

/**
 * Read publication year from a song's metadata.
 * This is the ONLY correct way to get the year.
 */
export function getPublicationYear(song: Song): string | null {
  return song.metadata?.publication_year ?? null;
}

/**
 * Generate controlled label copy from publishers.
 * Format: © {year} {Publisher1 (PRO)} / {Publisher2 (PRO)} (adm. at TribesRightsManagement.com). All rights reserved.
 */
export function generateLabelCopy(
  year: string | null,
  publishers: Array<{ name: string; pro?: string | null }>
): string {
  const yearStr = year || '—';
  const pubStr = publishers
    .map((p) => (p.pro ? `${p.name} (${p.pro})` : p.name))
    .join(' / ');
  return `© ${yearStr} ${pubStr} (adm. at TribesRightsManagement.com). All rights reserved.`;
}

// ============================================================
// DEPRECATED — Do NOT use these field names anywhere
// ============================================================
// yearWritten        → use publication_year
// songType           → use song_type
// hasBeenRecorded    → use release_status
// chordChartPath     → use chord_chart_path
// chordChartDisplayName → use chord_chart_file
// alternateTitles    → use alternate_titles
// creation_year      → use publication_year
// year_written       → use publication_year (metadata key)
// has_been_recorded  → use release_status (metadata key)
// chord_chart_display_name → use chord_chart_file (metadata key)
// ============================================================
