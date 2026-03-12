import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  PlatformCard,
  PlatformCardHeader,
  PlatformCardTitle,
  PlatformCardBody,
  PlatformDetailRow,
  PlatformDetailRowGroup,
  PlatformStatCard,
  PlatformStatCardGrid,
  PlatformTable,
  PlatformTableHeader,
  PlatformTableBody,
  PlatformTableRow,
  PlatformTableHead,
  PlatformTableCell,
  PlatformTableEmpty,
  PlatformTableBadge,
} from "@/components/platform-ui";

interface ClientOverviewTabProps {
  client: any;
}

function formatAddress(c: any): string {
  const parts = [
    c.address_line1,
    c.address_line2,
    [c.city, c.state_province].filter(Boolean).join(", "),
    c.postal_code,
    c.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : "—";
}

export default function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const navigate = useNavigate();

  // Song count
  const { data: songCount = 0, isLoading: songLoading } = useQuery({
    queryKey: ["client-songs-count", client.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("song_interested_parties")
        .select("id, interested_parties!inner(client_account_id)", { count: "exact", head: true })
        .eq("interested_parties.client_account_id", client.id);
      if (error) return 0;
      return count || 0;
    },
  });

  // IPI count
  const { data: ipiCount = 0, isLoading: ipiLoading } = useQuery({
    queryKey: ["client-ipi-count", client.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("client_ipi_numbers")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", client.id);
      if (error) return 0;
      return count || 0;
    },
  });

  // Deals count via interested_parties → song_writers → deals
  const { data: dealCount = 0, isLoading: dealLoading } = useQuery({
    queryKey: ["client-deals-count", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_associations")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", client.id);
      if (error) return 0;
      return data?.length || 0;
    },
  });

  // Pending queue items
  const { data: pendingCount = 0, isLoading: pendingLoading } = useQuery({
    queryKey: ["client-pending-count", client.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("song_queue")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", client.id)
        .in("status", ["submitted", "in_review"]);
      if (error) return 0;
      return count || 0;
    },
  });

  // Recent submissions
  const { data: recentSubmissions = [] } = useQuery({
    queryKey: ["client-recent-submissions", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_queue")
        .select("id, title, status, created_at")
        .eq("client_account_id", client.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data || [];
    },
  });

  const statusVariant: Record<string, "default" | "success" | "warning"> = {
    submitted: "default",
    in_review: "warning",
    approved: "success",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Details */}
      <PlatformCard>
        <PlatformCardHeader>
          <PlatformCardTitle>Client Information</PlatformCardTitle>
        </PlatformCardHeader>
        <PlatformCardBody className="p-0">
          <PlatformDetailRowGroup>
            <PlatformDetailRow label="Email" value={client.primary_email || "—"} />
            <PlatformDetailRow label="Address" value={formatAddress(client)} />
            <PlatformDetailRow
              label="Created"
              value={format(new Date(client.created_at), "MMM d, yyyy")}
            />
          </PlatformDetailRowGroup>
        </PlatformCardBody>
      </PlatformCard>

      {/* Right: Activity */}
      <div className="space-y-6">
        <PlatformStatCardGrid columns={2}>
          <PlatformStatCard label="Songs" value={songCount} size="sm" loading={songLoading} />
          <PlatformStatCard label="Pending" value={pendingCount} size="sm" loading={pendingLoading} />
          <PlatformStatCard label="Contracts" value={dealCount} size="sm" loading={dealLoading} />
          <PlatformStatCard label="IPI Numbers" value={ipiCount} size="sm" loading={ipiLoading} />
        </PlatformStatCardGrid>

        <PlatformCard>
          <PlatformCardHeader>
            <PlatformCardTitle>Recent Submissions</PlatformCardTitle>
          </PlatformCardHeader>
          <PlatformCardBody className="p-0">
            <PlatformTable>
              <PlatformTableHeader>
                <PlatformTableRow header>
                  <PlatformTableHead>Title</PlatformTableHead>
                  <PlatformTableHead>Status</PlatformTableHead>
                  <PlatformTableHead align="right">Submitted</PlatformTableHead>
                </PlatformTableRow>
              </PlatformTableHeader>
              <PlatformTableBody>
                {recentSubmissions.length === 0 ? (
                  <PlatformTableEmpty colSpan={3}>
                    <span className="text-sm text-muted-foreground">No submissions yet</span>
                  </PlatformTableEmpty>
                ) : (
                  recentSubmissions.map((sub: any) => (
                    <PlatformTableRow
                      key={sub.id}
                      clickable
                      onClick={() => navigate(`/rights/queue/${sub.id}`)}
                    >
                      <PlatformTableCell>{sub.title}</PlatformTableCell>
                      <PlatformTableCell>
                        <PlatformTableBadge variant={statusVariant[sub.status] || "default"}>
                          {sub.status?.replace("_", " ")}
                        </PlatformTableBadge>
                      </PlatformTableCell>
                      <PlatformTableCell align="right" muted>
                        {format(new Date(sub.created_at), "MMM d, yyyy")}
                      </PlatformTableCell>
                    </PlatformTableRow>
                  ))
                )}
              </PlatformTableBody>
            </PlatformTable>
          </PlatformCardBody>
        </PlatformCard>
      </div>
    </div>
  );
}
