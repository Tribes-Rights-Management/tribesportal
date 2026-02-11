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

interface Territory {
  code: string;
  name: string;
  region: string;
}

function generateTerritorySummary(
  mode: string,
  selectedCodes: string[],
  allTerritories: Territory[]
): string {
  if (mode === "world") return "World";
  const names = selectedCodes
    .map((code) => allTerritories.find((t) => t.code === code)?.name)
    .filter(Boolean);
  if (mode === "world_except") {
    if (names.length <= 3) return `World except ${names.join(", ")}`;
    return `World except ${names.length} territories`;
  }
  if (names.length <= 3) return names.join(", ");
  return `${names.length} territories`;
}

function TerritoryGrid({
  territories,
  selectedCodes,
  onToggle,
  onToggleRegion,
  onSelectAll,
  onClearAll,
  mode,
}: {
  territories: Territory[];
  selectedCodes: string[];
  onToggle: (code: string) => void;
  onToggleRegion: (region: string, codes: string[]) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  mode: string;
}) {
  const regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
  const grouped = regions.map((region) => ({
    region,
    countries: territories.filter((t) => t.region === region),
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
        <button type="button" onClick={onSelectAll} className="text-xs text-primary hover:underline">
          Select All
        </button>
        <button type="button" onClick={onClearAll} className="text-xs text-muted-foreground hover:underline">
          Clear All
        </button>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {mode === "world_except"
            ? `${territories.length - selectedCodes.length} of ${territories.length} territories included`
            : `${selectedCodes.length} of ${territories.length} territories selected`}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {grouped.map(({ region, countries }) => {
          const regionCodes = countries.map((c) => c.code);
          const allChecked = regionCodes.length > 0 && regionCodes.every((c) => selectedCodes.includes(c));
          const someChecked = regionCodes.some((c) => selectedCodes.includes(c));

          return (
            <div key={region}>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allChecked;
                  }}
                  onChange={() => onToggleRegion(region, regionCodes)}
                  className="rounded border-border"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{region}</span>
              </label>
              <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-1">
                {countries.map((country) => (
                  <label key={country.code} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedCodes.includes(country.code)}
                      onChange={() => onToggle(country.code)}
                      className="rounded border-border"
                    />
                    <span className="text-[12px] text-foreground/80">{country.name}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RightsDealDetailPage() {
  const { dealNumber } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = dealNumber === "new" || !dealNumber;

  const [writerId, setWriterId] = useState<string | null>(null);
  const [writerName, setWriterName] = useState("");
  const [writerPro, setWriterPro] = useState("");
  const [writerIpi, setWriterIpi] = useState("");
  const [writerSearch, setWriterSearch] = useState("");
  const [showWriterResults, setShowWriterResults] = useState(false);
  const [writerShare, setWriterShare] = useState(100);
  const [notes, setNotes] = useState("");
  const [publishers, setPublishers] = useState<DealPublisher[]>([]);
  const [saving, setSaving] = useState(false);

  const [pubSearchIndex, setPubSearchIndex] = useState<number | null>(null);
  const [pubSearchQuery, setPubSearchQuery] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<"contract" | "territories" | "songs">("contract");

  // Territory state
  const [territoryMode, setTerritoryMode] = useState<string>("world");
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);

  const { data: existingDeal } = useQuery({
    queryKey: ["deal-detail", dealNumber],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("deals")
        .select(`
          id, deal_number, name, territory, territory_mode, status, writer_share,
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
    if (!existingDeal) return;
    (async () => {
      setWriterId(existingDeal.writer_id);
      setWriterName((existingDeal as any).writers?.name || "");
      setWriterPro((existingDeal as any).writers?.pro || "");
      setWriterIpi((existingDeal as any).writers?.ipi_number || "");
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

      // Load territory data
      setTerritoryMode((existingDeal as any).territory_mode || "world");
      if ((existingDeal as any).territory_mode && (existingDeal as any).territory_mode !== "world") {
        const { data: dealTerrs } = await supabase
          .from("deal_territories")
          .select("territory_code")
          .eq("deal_id", existingDeal.id);
        if (dealTerrs) {
          setSelectedTerritories(dealTerrs.map((t: any) => t.territory_code));
        }
      }
    })();
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

      const { data: publishers, error } = await supabase
        .from("interested_parties")
        .select("id, name, pro_id")
        .eq("party_type", "publisher")
        .ilike("name", `%${pubSearchQuery}%`)
        .limit(8);

      if (error) { console.error("Publisher search error:", error); return []; }
      if (!publishers || publishers.length === 0) return [];

      const proIds = [...new Set(publishers.map(p => p.pro_id).filter(Boolean))] as string[];
      let proMap: Record<string, string> = {};
      if (proIds.length > 0) {
        const { data: pros } = await supabase
          .from("pro_organizations")
          .select("id, abbreviation")
          .in("id", proIds);
        if (pros) proMap = Object.fromEntries(pros.map(p => [p.id, p.abbreviation]));
      }

      const pubIds = publishers.map(p => p.id);
      let ipiMap: Record<string, string> = {};
      const { data: ipis } = await supabase
        .from("interested_party_ipi_numbers")
        .select("interested_party_id, ipi_number")
        .in("interested_party_id", pubIds);
      if (ipis) {
        ipis.forEach((ipi: any) => {
          if (!ipiMap[ipi.interested_party_id]) ipiMap[ipi.interested_party_id] = ipi.ipi_number;
        });
      }

      return publishers.map(p => ({
        id: p.id,
        name: p.name,
        pro: proMap[p.pro_id || ""] || "",
        ipi_number: ipiMap[p.id] || "",
      }));
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

  const { data: allTerritories } = useQuery({
    queryKey: ["territories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("territories")
        .select("code, name, region")
        .order("region")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as Territory[];
    },
  });

  const selectWriter = (writer: any) => {
    setWriterId(writer.id);
    setWriterName(writer.name);
    setWriterPro(writer.pro || "");
    setWriterIpi(writer.ipi_number || "");
    setWriterSearch("");
    setShowWriterResults(false);
  };

  const clearWriter = () => {
    setWriterId(null);
    setWriterName("");
    setWriterPro("");
    setWriterIpi("");
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
    const ipi = pub.ipi_number || pub.interested_party_ipi_numbers?.[0]?.ipi_number || "";
    const updated = [...publishers];
    updated[index] = {
      ...updated[index],
      publisher_id: pub.id,
      publisher_name: pub.name,
      publisher_pro: pub.pro || "",
      publisher_ipi: ipi,
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
    const territorySummary = generateTerritorySummary(territoryMode, selectedTerritories, allTerritories || []);
    const dealName = `${writerName} — ${territorySummary} Deal`;

    try {
      if (isNew) {
        console.log("Creating new deal...", { writerId, dealName, territoryMode, writerShare });

        const { data: newDeal, error: dealError } = await supabase
          .from("deals")
          .insert({
            writer_id: writerId,
            name: dealName,
            territory_mode: territoryMode,
            territory: territorySummary,
            status: "active",
            writer_share: writerShare,
            notes: notes || null,
          } as any)
          .select("id, deal_number")
          .single();

        if (dealError) {
          console.error("Deal insert error:", dealError);
          toast.error("Failed to create deal: " + dealError.message);
          setSaving(false);
          return;
        }

        console.log("Deal created:", newDeal);

        // Insert publishers
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
        if (pubError) {
          console.error("Publisher insert error:", pubError);
          toast.error("Failed to save publishers: " + pubError.message);
          setSaving(false);
          return;
        }

        // Save territories
        if (territoryMode !== "world" && selectedTerritories.length > 0) {
          const terrRows = selectedTerritories.map((code) => ({
            deal_id: newDeal.id,
            territory_code: code,
          }));
          await supabase.from("deal_territories").insert(terrRows);
        }

        toast.success("Deal created");
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        navigate(`/rights/parties/deals/${newDeal.deal_number}`);
      } else if (existingDeal) {
        const { error: dealError } = await supabase
          .from("deals")
          .update({
            writer_id: writerId,
            name: dealName,
            territory_mode: territoryMode,
            territory: territorySummary,
            writer_share: writerShare,
            notes: notes || null,
          } as any)
          .eq("id", (existingDeal as any)!.id);
        if (dealError) throw dealError;

        // Replace publishers
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

        // Replace territories
        await supabase.from("deal_territories").delete().eq("deal_id", (existingDeal as any)!.id);
        if (territoryMode !== "world" && selectedTerritories.length > 0) {
          const terrRows = selectedTerritories.map((code) => ({
            deal_id: (existingDeal as any)!.id,
            territory_code: code,
          }));
          await supabase.from("deal_territories").insert(terrRows);
        }

        toast.success("Deal updated");
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        queryClient.invalidateQueries({ queryKey: ["deal-detail", dealNumber] });
      }
    } catch (err: any) {
      console.error("Save error:", err);
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
    queryKey: ["deal-songs", existingDeal?.id],
    queryFn: async () => {
      if (!existingDeal?.id) return [];
      const { data, error } = await supabase
        .from("song_writers")
        .select(`id, share, songs (id, title, song_number), writers (name)`)
        .eq("deal_id", existingDeal.id);
      if (error) throw error;
      return data;
    },
    enabled: !!existingDeal?.id,
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
            {isNew ? "New Deal" : `Deal #${existingDeal?.deal_number || dealNumber}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && existingDeal && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Writer IPI */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Writer IPI</label>
              <div className="h-9 flex items-center text-sm text-muted-foreground">{writerIpi || "—"}</div>
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
                          onBlur={() => setTimeout(() => setPubSearchIndex(null), 200)}
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

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <div className="flex gap-6">
          {(["contract", "territories", "songs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {tab === "contract" ? "Contract" : tab === "territories" ? "Territories" : "Associated Songs"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Tab */}
      {activeTab === "contract" && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground block mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this deal..."
              rows={4}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>
      )}

      {/* Territories Tab */}
      {activeTab === "territories" && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <select
              value={territoryMode}
              onChange={(e) => {
                setTerritoryMode(e.target.value);
                if (e.target.value === "world") {
                  setSelectedTerritories([]);
                }
              }}
              className="h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="world">World (All Territories)</option>
              <option value="world_except">World Except...</option>
              <option value="selected">Selected Territories Only</option>
            </select>

            {territoryMode !== "world" && (
              <span className="text-[11px] text-muted-foreground">
                {selectedTerritories.length} {territoryMode === "world_except" ? "excluded" : "selected"}
              </span>
            )}
          </div>

          {territoryMode !== "world" && allTerritories && (
            <TerritoryGrid
              territories={allTerritories}
              selectedCodes={selectedTerritories}
              onToggle={(code: string) => {
                setSelectedTerritories((prev) =>
                  prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
                );
              }}
              onToggleRegion={(_region: string, codes: string[]) => {
                const allSelected = codes.every((c) => selectedTerritories.includes(c));
                if (allSelected) {
                  setSelectedTerritories((prev) => prev.filter((c) => !codes.includes(c)));
                } else {
                  setSelectedTerritories((prev) => [...new Set([...prev, ...codes])]);
                }
              }}
              onSelectAll={() => {
                if (allTerritories) setSelectedTerritories(allTerritories.map((t) => t.code));
              }}
              onClearAll={() => setSelectedTerritories([])}
              mode={territoryMode}
            />
          )}

          {territoryMode === "world" && (
            <p className="text-sm text-muted-foreground">
              This deal covers all CISAC-approved territories worldwide.
            </p>
          )}
        </div>
      )}

      {/* Associated Songs Tab */}
      {activeTab === "songs" && (
        <div className="mt-4">
          {isNew ? (
            <p className="text-sm text-muted-foreground">
              Save this deal first to associate songs.
            </p>
          ) : associatedSongs && associatedSongs.length > 0 ? (
            <div className="space-y-2">
              {associatedSongs.map((sw: any) => (
                <div
                  key={sw.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">#{sw.songs?.song_number}</span>
                    <span className="text-sm">{sw.songs?.title || "Untitled"}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{sw.share}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No songs are using this deal yet.
            </p>
          )}
        </div>
      )}
    </AppPageContainer>
  );
}
