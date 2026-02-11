import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus } from "lucide-react";
import {
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
} from "@/components/app-ui";

export default function DealsTabContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: deals, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          id, deal_number, name, territory, status, writer_share,
          effective_date, end_date, created_at,
          writers (id, name, pro, ipi_number),
          deal_publishers (id, publisher_name, publisher_pro, share, tribes_administered)
        `)
        .order("deal_number", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: songCounts } = useQuery({
    queryKey: ["deal-song-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_writers")
        .select("deal_id")
        .not("deal_id", "is", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        counts[row.deal_id] = (counts[row.deal_id] || 0) + 1;
      });
      return counts;
    },
  });

  const filteredDeals = (deals || []).filter((deal: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      deal.writers?.name?.toLowerCase().includes(q) ||
      deal.deal_publishers?.some((p: any) => p.publisher_name?.toLowerCase().includes(q)) ||
      deal.name?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by writer or publisher..."
            className="w-full h-9 px-3 pl-9 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-foreground/20"
          />
        </div>
        <button
          onClick={() => navigate("/rights/parties/deals/new")}
          className="flex items-center gap-1.5 text-[12px] uppercase tracking-wider font-medium text-foreground hover:text-foreground/80 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Deal
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading deals...</p>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm font-medium text-foreground">No deals found</p>
          <p className="text-[13px] text-muted-foreground mt-1">
            Create a deal to define reusable writer–publisher–administrator relationships.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0">
            <AppTable columns={["8%", "30%", "32%", "15%", "15%"]}>
              <AppTableHeader>
                <AppTableRow header>
                  <AppTableHead className="pl-5">#</AppTableHead>
                  <AppTableHead>Writer</AppTableHead>
                  <AppTableHead>Publishers</AppTableHead>
                  <AppTableHead>Territory</AppTableHead>
                  <AppTableHead className="text-right pr-5">Songs</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {filteredDeals.map((deal: any) => {
                  const publishers = deal.deal_publishers || [];
                  const publisherDisplay = publishers.length > 2
                    ? `${publishers[0].publisher_name}, ${publishers[1].publisher_name} +${publishers.length - 2}`
                    : publishers.map((p: any) => p.publisher_name).join(", ");

                  return (
                    <AppTableRow
                      key={deal.id}
                      clickable
                      onClick={() => navigate(`/rights/parties/deals/${deal.deal_number}`)}
                    >
                      <AppTableCell muted className="pl-5">{deal.deal_number}</AppTableCell>
                      <AppTableCell>
                        <div className="flex items-center gap-2">
                          <span>{deal.writers?.name || "—"}</span>
                          {deal.writers?.pro && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {deal.writers.pro}
                            </span>
                          )}
                        </div>
                      </AppTableCell>
                      <AppTableCell muted>
                        {publisherDisplay || <span className="italic">None</span>}
                      </AppTableCell>
                      <AppTableCell muted>{deal.territory}</AppTableCell>
                      <AppTableCell muted className="text-right pr-5 tabular-nums">
                        {songCounts?.[deal.id] || 0}
                      </AppTableCell>
                    </AppTableRow>
                  );
                })}
              </AppTableBody>
            </AppTable>
          </div>
        </div>
      )}
    </>
  );
}
