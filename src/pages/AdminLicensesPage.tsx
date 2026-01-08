import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LicenseRequest, RequestStatus, STATUS_LABELS } from "@/types";
import { format } from "date-fns";

const ADMIN_STATUSES: RequestStatus[] = [
  "submitted",
  "in_review",
  "needs_info",
  "approved",
  "awaiting_signature",
  "awaiting_payment",
  "done",
];

export default function AdminLicensesPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<RequestStatus | "all">("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from("license_packages")
        .select("*")
        .neq("status", "draft")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.license_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.licensee_legal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.licensee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.track_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.song_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.recording_artist?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = activeStatus === "all" || request.status === activeStatus;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Determine empty state type
  const isFirstTime = requests.length === 0;
  const isFilteredEmpty = !isFirstTime && filteredRequests.length === 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl opacity-0" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl animate-content-fade">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[15px] font-medium mb-1">Licenses</h1>
          <p className="text-[13px] text-muted-foreground">
            All license requests.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, track, License ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={activeStatus} onValueChange={(v) => setActiveStatus(v as RequestStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({requests.length})</SelectItem>
              {ADMIN_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                  {statusCounts[status] > 0 && ` (${statusCounts[status]})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isFirstTime ? (
          <div className="py-16">
            <p className="text-[14px] font-medium mb-1">No license activity yet</p>
            <p className="text-[13px] text-muted-foreground">
              License requests will appear here once submitted.
            </p>
          </div>
        ) : isFilteredEmpty ? (
          <div className="py-16">
            <p className="text-[14px] font-medium mb-1">No license requests</p>
            <p className="text-[13px] text-muted-foreground">
              {searchQuery ? "No license requests match your search." : "There's nothing to review right now."}
            </p>
          </div>
        ) : (
          <div>
            {/* Header - minimal, left-aligned */}
            <div className="hidden md:flex items-center h-10 text-[12px] text-muted-foreground">
              <span className="w-[130px]">License ID</span>
              <span className="w-[100px]">Date</span>
              <span className="flex-1 min-w-0">Requester</span>
              <span className="flex-1 min-w-0">Track</span>
              <span className="w-[100px] text-right">Status</span>
            </div>

            {/* Rows - 56px height, spacing-based separation */}
            {filteredRequests.map((request, index) => {
              const requesterName =
                [request.first_name, request.last_name].filter(Boolean).join(" ") ||
                request.licensee_legal_name ||
                "Unknown";
              const trackTitle = request.track_title || request.song_title || "—";
              const submittedDate = request.submitted_at
                ? format(new Date(request.submitted_at), "MMM d")
                : "—";

              return (
                <div
                  key={request.id}
                  onClick={() => navigate(`/admin/licenses/${request.id}`)}
                  className="h-14 cursor-pointer hover:bg-muted/30 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring flex items-center"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/admin/licenses/${request.id}`);
                    }
                  }}
                >
                  {/* Desktop */}
                  <div className="hidden md:flex items-center w-full">
                    <span className="w-[130px] text-[13px] text-muted-foreground font-mono">{request.license_id || "—"}</span>
                    <span className="w-[100px] text-[13px] text-muted-foreground">{submittedDate}</span>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[14px] truncate">{requesterName}</p>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[14px] truncate">{trackTitle}</p>
                    </div>
                    <div className="w-[100px] text-right">
                      <StatusBadge status={request.status} />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden flex items-center justify-between w-full px-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[14px] truncate">{trackTitle}</span>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-[13px] text-muted-foreground">{requesterName}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
