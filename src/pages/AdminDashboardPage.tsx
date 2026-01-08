import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { LicenseRequest, RequestStatus, STATUS_LABELS } from "@/types";
import { format } from "date-fns";

type StatusFilter = "all" | RequestStatus;

const STATUS_ORDER: RequestStatus[] = [
  "submitted",
  "in_review",
  "needs_info",
  "approved",
  "awaiting_signature",
  "awaiting_payment",
  "done",
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("submitted");

  useEffect(() => {
    fetchRequests();
    fetchPendingCount();
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

  async function fetchPendingCount() {
    try {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("account_status", "pending");

      if (!error && count !== null) {
        setPendingCount(count);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  }

  // Calculate counts
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter requests
  const filteredRequests = activeFilter === "all"
    ? requests
    : requests.filter(r => r.status === activeFilter);

  // Take recent 7 for display
  const displayRequests = filteredRequests.slice(0, 7);

  // Determine empty state type
  const isFirstTime = requests.length === 0;
  const isFilteredEmpty = !isFirstTime && displayRequests.length === 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl opacity-0" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl animate-content-fade">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of current licensing activity.
          </p>
        </div>

        {/* Status Overview - Always visible with 0 values */}
        <section className="mb-10">
          <div className="space-y-0">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] || 0;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex items-center justify-between w-full py-2.5 text-left transition-colors ${
                    activeFilter === status ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-sm">{STATUS_LABELS[status]}</span>
                  <span className="text-sm tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Requests */}
        <section className="mb-10">
          <h2 className="text-sm font-medium mb-4">Recent license requests</h2>

          {isFirstTime ? (
            <div className="py-12">
              <p className="text-sm font-medium mb-1">No license activity yet</p>
              <p className="text-sm text-muted-foreground">
                License requests will appear here once submitted.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="py-12">
              <p className="text-sm font-medium mb-1">No license requests</p>
              <p className="text-sm text-muted-foreground">
                There's nothing to review right now.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {displayRequests.map((request) => {
                const requesterName = [request.first_name, request.last_name].filter(Boolean).join(" ") || request.licensee_legal_name || "Unknown";
                const trackTitle = request.track_title || request.song_title || "Untitled";
                const submittedDate = request.submitted_at
                  ? format(new Date(request.submitted_at), "MMM d, yyyy")
                  : "—";

                return (
                  <div
                    key={request.id}
                    onClick={() => navigate(`/admin/licenses/${request.id}`)}
                    className="flex items-center justify-between h-14 cursor-pointer hover:bg-muted/[0.03] -mx-2 px-2 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/admin/licenses/${request.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{submittedDate}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{trackTitle}</p>
                          {request.license_id && (
                            <span className="text-xs text-muted-foreground">{request.license_id}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{requesterName}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Access Requests (Admin only) */}
        {pendingCount > 0 && (
          <section>
            <h2 className="text-sm font-medium mb-4">Access requests</h2>
            <button
              onClick={() => navigate("/admin/access-requests")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {pendingCount} access request{pendingCount !== 1 ? "s" : ""} awaiting review
            </button>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
