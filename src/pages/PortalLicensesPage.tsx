import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LicenseRequest, STATUS_LABELS } from "@/types";
import { format } from "date-fns";

export default function PortalLicensesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const isFirstTime = requests.length === 0;

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-1">Licenses</h1>
            <p className="text-sm text-muted-foreground">
              All license requests and records.
            </p>
          </div>
          <Link
            to="/portal/request/new"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            New request
          </Link>
        </div>

        {/* List */}
        {isFirstTime ? (
          <div className="py-16">
            <p className="text-sm font-medium mb-1">No records yet</p>
            <p className="text-sm text-muted-foreground">
              Submitted requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[120px_1.5fr_100px_100px_100px] gap-4 pb-3 text-xs font-medium text-muted-foreground">
              <span>License ID</span>
              <span>Track Title</span>
              <span>Status</span>
              <span>Submitted</span>
              <span>Updated</span>
            </div>

            {/* Rows */}
            {requests.map((request) => {
              const title = request.track_title || request.song_title || request.project_title || "Untitled";
              const submittedDate = request.submitted_at
                ? format(new Date(request.submitted_at), "MMM d, yyyy")
                : "—";
              const updatedDate = format(new Date(request.updated_at), "MMM d, yyyy");

              return (
                <div
                  key={request.id}
                  onClick={() => navigate(`/portal/request/${request.id}`)}
                  className="h-14 hover:bg-muted/[0.03] -mx-2 px-2 rounded-md transition-colors cursor-pointer flex items-center"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/portal/request/${request.id}`);
                    }
                  }}
                >
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[120px_1.5fr_100px_100px_100px] gap-4 items-center w-full">
                    <span className="text-xs font-mono text-muted-foreground truncate">
                      {request.license_id || "—"}
                    </span>
                    <span className="text-sm truncate">{title}</span>
                    <span className="text-xs text-muted-foreground">
                      {STATUS_LABELS[request.status] || request.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{submittedDate}</span>
                    <span className="text-xs text-muted-foreground">{updatedDate}</span>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[200px]">{title}</span>
                      <span className="text-xs text-muted-foreground">
                        {STATUS_LABELS[request.status] || request.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        {request.license_id || "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">{submittedDate}</span>
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
