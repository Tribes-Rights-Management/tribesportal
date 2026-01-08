import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { PortalOnboardingBanner } from "@/components/PortalOnboardingBanner";
import { PortalOnboarding } from "@/components/PortalOnboarding";
import { LicenseRequest, RequestStatus, STATUS_LABELS } from "@/types";
import { format } from "date-fns";

type StatusFilter = "all" | RequestStatus;

const STATUS_ORDER: RequestStatus[] = [
  "submitted",
  "in_review",
  "needs_info",
  "awaiting_signature",
  "awaiting_payment",
  "done",
];

export default function PortalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from("license_packages")
        .select("*")
        .eq("user_id", user!.id)
        .neq("status", "draft")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
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
      {/* Onboarding Modal */}
      <PortalOnboarding />
      
      <div className="max-w-3xl animate-content-fade">
        {/* Onboarding Banner */}
        <PortalOnboardingBanner />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-[15px] font-medium mb-1">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground">
            Request overview and status.
          </p>
        </div>

        {/* Status Overview */}
        <section className="mb-12">
          <div className="space-y-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center justify-between w-full h-11 text-left transition-colors ${
                activeFilter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[14px]">All requests</span>
              <span className="text-[14px] tabular-nums">{requests.length}</span>
            </button>
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] || 0;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex items-center justify-between w-full h-11 text-left transition-colors ${
                    activeFilter === status ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-[14px]">{STATUS_LABELS[status]}</span>
                  <span className="text-[14px] tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Requests */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Recent requests</h2>
            <Link
              to="/portal/request/new"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              + New request
            </Link>
          </div>

          {isFirstTime ? (
            <div className="py-12">
              <p className="text-[14px] font-medium mb-1">No records yet</p>
              <p className="text-[13px] text-muted-foreground">
                Submitted requests will appear here.
              </p>
            </div>
          ) : isFilteredEmpty ? (
            <div className="py-12">
              <p className="text-[13px] text-muted-foreground">
                No requests match this filter.
              </p>
            </div>
          ) : (
            <div>
              {displayRequests.map((request) => {
                const title = request.track_title || request.song_title || request.project_title || "Untitled";
                const submittedDate = request.submitted_at 
                  ? format(new Date(request.submitted_at), "MMM d") 
                  : "—";

                return (
                  <div
                    key={request.id}
                    onClick={() => navigate(`/portal/request/${request.id}`)}
                    className="flex items-center justify-between h-14 cursor-pointer hover:bg-muted/30 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/portal/request/${request.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] truncate">{title}</p>
                        <p className="text-[13px] text-muted-foreground">{submittedDate}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
