import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AppPageLayout, AppSection } from "@/components/app-ui";
import { ContentPanel } from "@/components/ui/page-shell";
import { toast } from "sonner";

/**
 * SONG DETAIL PAGE — Individual song view within Rights Catalogue
 * 
 * Route: /rights/catalogue/:songId
 * Shows all metadata, writers, status, and related information for a single song.
 * Back arrow returns to /rights/catalogue.
 */

interface SongDetail {
  id: string;
  title: string;
  metadata: Record<string, any>;
  created_at: string;
  is_active: boolean;
  iswc: string | null;
  language: string | null;
  genre: string | null;
  duration_seconds: number | null;
  release_date: string | null;
  alternate_titles: string[] | null;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-border last:border-0">
      <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-[13px] text-foreground">{children}</span>
    </div>
  );
}

export default function SongDetailPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<SongDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSong() {
      if (!songId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("songs")
          .select("id, title, metadata, created_at, is_active, iswc, language, genre, duration_seconds, release_date, alternate_titles")
          .eq("id", songId)
          .single();
        
        if (error) throw error;
        setSong(data as SongDetail);
      } catch (err: any) {
        console.error("Failed to fetch song:", err);
        toast.error("Song not found");
        navigate("/rights/catalogue");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSong();
  }, [songId, navigate]);

  if (isLoading) {
    return (
      <AppPageLayout
        title="Loading…"
        backLink={{ to: "/rights/catalogue", label: "Catalogue" }}
      >
        <AppSection spacing="md">
          <p className="text-sm text-muted-foreground">Loading song details…</p>
        </AppSection>
      </AppPageLayout>
    );
  }

  if (!song) {
    return (
      <AppPageLayout
        title="Not Found"
        backLink={{ to: "/rights/catalogue", label: "Catalogue" }}
      >
        <AppSection spacing="md">
          <p className="text-sm text-muted-foreground">This song could not be found.</p>
        </AppSection>
      </AppPageLayout>
    );
  }

  const metadata = (song.metadata as Record<string, any>) || {};
  const writers: { name?: string; ipi?: string; split?: number }[] = metadata.writers || [];

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AppPageLayout
      title={song.title}
      backLink={{ to: "/rights/catalogue", label: "Catalogue" }}
    >
      <div className="space-y-6 mt-4">
        {/* Overview */}
        <ContentPanel>
          <div className="px-5 py-4">
            <h3 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-2">
              Overview
            </h3>
            <div className="divide-y divide-border">
              <DetailRow label="Title">{song.title}</DetailRow>
              <DetailRow label="Status">
                {song.is_active ? (
                  <span className="text-[hsl(var(--success))]">Active</span>
                ) : (
                  <span className="text-muted-foreground">Inactive</span>
                )}
              </DetailRow>
              <DetailRow label="Added">
                {format(new Date(song.created_at), "MMMM d, yyyy")}
              </DetailRow>
              {song.iswc && <DetailRow label="ISWC">{song.iswc}</DetailRow>}
              {song.language && <DetailRow label="Language">{song.language}</DetailRow>}
              {song.genre && <DetailRow label="Genre">{song.genre}</DetailRow>}
              {song.duration_seconds && (
                <DetailRow label="Duration">{formatDuration(song.duration_seconds)}</DetailRow>
              )}
              {song.release_date && (
                <DetailRow label="Release Date">
                  {format(new Date(song.release_date), "MMMM d, yyyy")}
                </DetailRow>
              )}
              {song.alternate_titles && song.alternate_titles.length > 0 && (
                <DetailRow label="Alternate Titles">
                  {song.alternate_titles.join(", ")}
                </DetailRow>
              )}
            </div>
          </div>
        </ContentPanel>

        {/* Songwriters */}
        {writers.length > 0 && (
          <ContentPanel>
            <div className="px-5 py-4">
              <h3 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-2">
                Songwriters
              </h3>
              <div className="divide-y divide-border">
                {writers.map((writer, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5">
                    <span className="text-[13px] text-foreground">
                      {writer.name || "Unknown"}
                    </span>
                    <div className="flex items-center gap-3">
                      {writer.ipi && (
                        <span className="text-[12px] text-muted-foreground font-mono">
                          {writer.ipi}
                        </span>
                      )}
                      {writer.split != null && (
                        <span className="text-[12px] text-muted-foreground">
                          {writer.split}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ContentPanel>
        )}

        {/* Lyrics (from metadata) */}
        {metadata.lyrics && (
          <ContentPanel>
            <div className="px-5 py-4">
              <h3 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-2">
                Lyrics
              </h3>
              <pre className="text-[13px] text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {metadata.lyrics}
              </pre>
            </div>
          </ContentPanel>
        )}
      </div>
    </AppPageLayout>
  );
}
