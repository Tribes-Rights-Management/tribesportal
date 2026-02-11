import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppPageContainer, AppCard, AppCardBody } from "@/components/app-ui";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Search } from "lucide-react";

interface DealPublisher {
  publisher_id: string | null;
  publisher_name: string;
  publisher_pro: string;
  publisher_ipi: string;
  share: number;
  tribes_administered: boolean;
  administrator_entity_id: string | null;
}

export default function RightsDealDetailPage() {
  const { dealNumber } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = dealNumber === "new";

  const [writerId, setWriterId] = useState<string | null>(null);
  const [writerName, setWriterName] = useState("");
  const [writerPro, setWriterPro] = useState("");
  const [writerSearch, setWriterSearch] = useState("");
  const [showWriterResults, setShowWriterResults] = useState(false);
  const [territory, setTerritory] = useState("World");
  const [status, setStatus] = useState("active");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [writerShare, setWriterShare] = useState(100);
  const [notes, setNotes] = useState("");
  const [publishers, setPublishers] = useState<DealPublisher[]>([]);
  const [saving, setSaving] = useState(false);

  const [pubSearchIndex, setPubSearchIndex] = useState<number | null>(null);
  const [pubSearchQuery, setPubSearchQuery] = useState("");

  const { data: existingDeal } = useQuery({
    queryKey: ["deal-detail", dealNumber],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("deals")
        .select(`
          id, deal_number, name, territory, status, writer_share,
          effective_date, end_date, notes, created_at, writer_id,
          writers (id, name, pro, ipi_number),
          deal_publishers (
            id, publisher_id, publisher_name, publisher_pro, publisher_ipi,
            share, tribes_administered, administrator_entity_id, sort_order
          )
        `)
        .eq("deal_number", parseInt(dealNumber!))
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (existingDeal) {
      setWriterId(existingDeal.writer_id);
      setWriterName((existingDeal as any).writers?.name || "");
      setWriterPro((existingDeal as any).writers?.pro || "");
      setTerritory(existingDeal.territory);
      setStatus(existingDeal.status);
      setEffectiveDate(existingDeal.effective_date || "");
      setEndDate(existingDeal.end_date || "");
      setWriterShare(existingDeal.writer_share);
      setNotes(existingDeal.notes || "");
      setPublishers(
        ((existingDeal as any).deal_publishers || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((p: any) => ({
            publisher_id: p.publisher_id,
            publisher_name: p.publisher_name,
            publisher_pro: p.publisher_pro || "",
            publisher_ipi: p.publisher_ipi || "",
            share: p.share,
            tribes_administered: p.tribes_administered,
            administrator_entity_id: p.administrator_entity_id,
          }))
      );
    }
  }, [existingDeal]);

  const { data: writerResults } = useQuery({
    queryKey: ["writer-search", writerSearch],
    queryFn: async () => {
      if (writerSearch.length < 2) return [];
      const { data, error } = await supabase
        .from("writers").select("id, name, pro, ipi_number")
        .ilike("name", `%${writerSearch}%`).limit(8);
      if (error) throw error;
      return data;
    },
    enabled: writerSearch.length >= 2 && showWriterResults,
  });

  const { data: pubResults } = useQuery({
    queryKey: ["pub-search", pubSearchQuery],
    queryFn: async () => {
      if (pubSearchQuery.length < 2) return [];
      const { data, error } = await supabase
        .from("publishers").select("id, name, pro, ipi_number")
        .ilike("name", `%${pubSearchQuery}%`).limit(8);
      if (error) throw error;
      return data;
    },
    enabled: pubSearchQuery.length >= 2 && pubSearchIndex !== null,
  });

  const { data: tribesEntities } = useQuery({
    queryKey: ["tribes-entities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tribes_entities").select("*");
      if (error) throw error;
      return data;
    },
  });

  const selectWriter = (writer: any) => {
    setWriterId(writer.id);
    setWriterName(writer.name);
    setWriterPro(writer.pro || "");
    setWriterSearch("");
    setShowWriterResults(false);
  };

  const clearWriter = () => {
    setWriterId(null);
    setWriterName("");
    setWriterPro("");
  };

  const addPublisher = () => {
    setPublishers([...publishers, {
      publisher_id: null, publisher_name: "", publisher_pro: "",
      publisher_ipi: "", share: 0, tribes_administered: true,
      administrator_entity_id: null,
    }]);
  };

  const removePublisher = (index: number) => {
    setPublishers(publishers.filter((_, i) => i !== index));
  };

  const selectPublisher = (index: number, pub: any) => {
    const updated = [...publishers];
    updated[index] = {
      ...updated[index],
      publisher_id: pub.id,
      publisher_name: pub.name,
      publisher_pro: pub.pro || "",
      publisher_ipi: pub.ipi_number || "",
    };
    if (updated[index].tribes_administered && pub.pro) {
      const entity = tribesEntities?.find((e: any) => e.pro === pub.pro);
      updated[index].administrator_entity_id = entity?.id || null;
    }
    setPublishers(updated);
    setPubSearchIndex(null);
    setPubSearchQuery("");
  };

  const updatePublisher = (index: number, field: string, value: any) => {
    const updated = [...publishers];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "tribes_administered") {
      if (value && updated[index].publisher_pro) {
        const entity = tribesEntities?.find((e: any) => e.pro === updated[index].publisher_pro);
        updated[index].administrator_entity_id = entity?.id || null;
      } else {
        updated[index].administrator_entity_id = null;
      }
    }
    setPublishers(updated);
  };

  const publisherTotal = publishers.reduce((sum, p) => sum + (p.share || 0), 0);
  const sharesValid = publishers.length === 0 || publisherTotal === writerShare;

  const handleSave = async () => {
    if (!writerId) { toast.error("Select a writer"); return; }
    if (publishers.length === 0) { toast.error("Add at least one publisher"); return; }
    if (publishers.some(p => !p.publisher_name.trim())) { toast.error("All publishers must have a name"); return; }
    if (publishers.some(p => p.share <= 0)) { toast.error("All publishers must have a share > 0%"); return; }
    if (!sharesValid) { toast.error(`Publisher shares must total ${writerShare}%`); return; }

    setSaving(true);
    const dealName = `${writerName} — ${territory} Deal`;

    try {
      if (isNew) {
        const { data: newDeal, error: dealError } = await supabase
          .from("deals")
          .insert({
            writer_id: writerId,
            name: dealName,
            territory,
            status,
            effective_date: effectiveDate || null,
            end_date: endDate || null,
            writer_share: writerShare,
            notes: notes || null,
          } as any)
          .select("id, deal_number")
          .single();
        if (dealError) throw dealError;

        const pubRows = publishers.map((p, i) => ({
          deal_id: newDeal.id,
          publisher_id: p.publisher_id,
          publisher_name: p.publisher_name,
          publisher_pro: p.publisher_pro,
          publisher_ipi: p.publisher_ipi,
          share: p.share,
          tribes_administered: p.tribes_administered,
          administrator_entity_id: p.administrator_entity_id,
          sort_order: i,
        }));
        const { error: pubError } = await supabase.from("deal_publishers").insert(pubRows as any);
        if (pubError) throw pubError;

        toast.success("Deal created");
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        navigate(`/rights/parties/deals/${newDeal.deal_number}`);
      } else {
        const { error: dealError } = await supabase
          .from("deals")
          .update({
            writer_id: writerId,
            name: dealName,
            territory,
            status,
            effective_date: effectiveDate || null,
            end_date: endDate || null,
            writer_share: writerShare,
            notes: notes || null,
          } as any)
          .eq("id", (existingDeal as any)!.id);
        if (dealError) throw dealError;

        await supabase.from("deal_publishers").delete().eq("deal_id", (existingDeal as any)!.id);

        const pubRows = publishers.map((p, i) => ({
          deal_id: (existingDeal as any)!.id,
          publisher_id: p.publisher_id,
          publisher_name: p.publisher_name,
          publisher_pro: p.publisher_pro,
          publisher_ipi: p.publisher_ipi,
          share: p.share,
          tribes_administered: p.tribes_administered,
          administrator_entity_id: p.administrator_entity_id,
          sort_order: i,
        }));
        if (pubRows.length > 0) {
          const { error: pubError } = await supabase.from("deal_publishers").insert(pubRows as any);
          if (pubError) throw pubError;
        }

        toast.success("Deal updated");
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        queryClient.invalidateQueries({ queryKey: ["deal-detail", dealNumber] });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save deal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingDeal) return;
    const { count } = await supabase
      .from("song_writers")
      .select("id", { count: "exact", head: true })
      .eq("deal_id", (existingDeal as any).id);
    if (count && count > 0) {
      toast.error(`This deal is associated with ${count} song(s). Remove those associations first.`);
      return;
    }
    if (!window.confirm("Delete this deal? This cannot be undone.")) return;
    const { error } = await supabase.from("deals").delete().eq("id", (existingDeal as any).id);
    if (error) { toast.error("Failed to delete deal"); return; }
    toast.success("Deal deleted");
    queryClient.invalidateQueries({ queryKey: ["deals"] });
    navigate("/rights/parties?tab=deals");
  };

  const { data: associatedSongs } = useQuery({
    queryKey: ["deal-songs", (existingDeal as any)?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_writers")
        .select(`id, share, songs (id, title, song_number), writers (name)`)
        .eq("deal_id", (existingDeal as any)!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!(existingDeal as any)?.id,
  });

  return (
    <AppPageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/rights/parties?tab=deals")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {isNew ? "New Deal" : `Deal #${dealNumber}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="text-xs text-destructive hover:text-destructive/80 transition-colors mr-2">
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving..." : isNew ? "Create Deal" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Deal Info */}
      <AppCard className="mb-4">
        <AppCardBody>
          <h3 className="text-sm font-medium mb-4">Deal Info</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Writer search */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Writer *</label>
              {writerId ? (
                <div className="flex items-center gap-2 h-9 px-3 bg-muted/30 border border-border rounded-lg">
                  <span className="text-sm flex-1">{writerName}</span>
                  {writerPro && <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{writerPro}</span>}
                  <button onClick={clearWriter} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text" value={writerSearch}
                    onChange={(e) => { setWriterSearch(e.target.value); setShowWriterResults(true); }}
                    onFocus={() => setShowWriterResults(true)}
                    placeholder="Search writers..."
                    className="w-full h-9 px-3 pl-9 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  {showWriterResults && writerResults && writerResults.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {writerResults.map((w: any) => (
                        <button key={w.id} onClick={() => selectWriter(w)}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between text-sm">
                          {w.name}
                          {w.pro && <span className="text-[11px] text-muted-foreground">{w.pro}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Writer share */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Writer Share *</label>
              <div className="flex items-center gap-1">
                <input type="number" value={writerShare}
                  onChange={(e) => setWriterShare(parseFloat(e.target.value) || 0)}
                  min="0" max="100" step="0.01"
                  className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* Territory */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Territory *</label>
              <input type="text" value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {/* Effective date */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Effective Date</label>
              <input type="date" value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">End Date</label>
              <input type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        </AppCardBody>
      </AppCard>

      {/* Publishers */}
      <AppCard className="mb-4">
        <AppCardBody>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Publishers</h3>
            <button onClick={addPublisher}
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" />
              Add Publisher
            </button>
          </div>

          {publishers.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No publishers added. Click "+ Add Publisher" to begin.</p>
          ) : (
            <div className="space-y-4">
              {publishers.map((pub, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto_80px_auto_auto] items-center gap-3 py-2 border-b border-border/30 last:border-0">
                  {/* Publisher name / search */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Publisher *</label>
                    {pub.publisher_id ? (
                      <div className="flex items-center gap-2 h-9 px-3 bg-muted/30 border border-border rounded-lg">
                        <span className="text-sm flex-1">{pub.publisher_name}</span>
                        {pub.publisher_pro && <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{pub.publisher_pro}</span>}
                        <button onClick={() => updatePublisher(index, "publisher_id", null)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input type="text" value={pub.publisher_name}
                          onChange={(e) => {
                            setPubSearchIndex(index);
                            setPubSearchQuery(e.target.value);
                            updatePublisher(index, "publisher_name", e.target.value);
                          }}
                          onFocus={() => setPubSearchIndex(index)}
                          placeholder="Search publishers..."
                          className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                        {pubSearchIndex === index && pubResults && pubResults.length > 0 && (
                          <div className="absolute z-10 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {pubResults.map((p: any) => (
                              <button key={p.id} onClick={() => selectPublisher(index, p)}
                                className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between text-sm">
                                {p.name}
                                {p.pro && <span className="text-[11px] text-muted-foreground">{p.pro}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* IPI */}
                  <div className="min-w-[80px]">
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">IPI #</label>
                    <div className="h-9 flex items-center text-sm text-muted-foreground">{pub.publisher_ipi || "—"}</div>
                  </div>

                  {/* Share */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Share *</label>
                    <input type="number" value={pub.share || ""}
                      onChange={(e) => updatePublisher(index, "share", parseFloat(e.target.value) || 0)}
                      min="0" max="100" step="0.01" placeholder="%"
                      className="w-full h-9 px-2 text-sm text-right bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>

                  {/* Tribes administered */}
                  <div className="min-w-[100px]">
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Admin *</label>
                    <select value={pub.tribes_administered ? "yes" : "no"}
                      onChange={(e) => updatePublisher(index, "tribes_administered", e.target.value === "yes")}
                      className="w-full h-9 px-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="yes">Tribes</option>
                      <option value="no">Not Tribes</option>
                    </select>
                  </div>

                  {/* Remove */}
                  <div className="pt-4">
                    <button onClick={() => removePublisher(index)} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Validation total */}
              <div className={`text-[11px] text-right ${sharesValid ? "text-muted-foreground" : "text-destructive font-medium"}`}>
                Publisher total: {publisherTotal}%{!sharesValid && ` (must equal ${writerShare}%)`}
              </div>
            </div>
          )}
        </AppCardBody>
      </AppCard>

      {/* Notes */}
      <AppCard className="mb-4">
        <AppCardBody>
          <h3 className="text-sm font-medium mb-3">Notes</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={3} placeholder="Internal notes about this deal..."
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        </AppCardBody>
      </AppCard>

      {/* Associated Songs (edit mode only) */}
      {!isNew && (
        <AppCard className="mb-4">
          <AppCardBody>
            <h3 className="text-sm font-medium mb-3">Associated Songs</h3>
            {!associatedSongs || associatedSongs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No songs associated with this deal yet.</p>
            ) : (
              <div className="space-y-2">
                {associatedSongs.map((sw: any) => (
                  <div key={sw.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">#{sw.songs?.song_number}</span>
                      <span className="text-sm">{sw.songs?.title || "Untitled"}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{sw.share}%</span>
                  </div>
                ))}
              </div>
            )}
          </AppCardBody>
        </AppCard>
      )}
    </AppPageContainer>
  );
}
