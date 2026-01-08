import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AccessRequest {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  company_type: string | null;
  account_status: string;
  created_at: string;
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  indie_church: "Indie / Church",
  commercial: "Commercial",
  broadcast: "Broadcast",
};

export default function AdminAccessRequestsPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests() {
    try {
      let query = supabase
        .from("profiles")
        .select("id, email, name, company, company_type, account_status, created_at")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("account_status", "pending");
      } else {
        query = query.in("account_status", ["pending", "active", "rejected"]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({ title: "Error", description: "Failed to load access requests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl opacity-0" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-content-fade">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="mb-1">Access Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage access requests.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("pending")}
            className={`text-sm transition-colors ${
              filter === "pending" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`text-sm transition-colors ${
              filter === "all" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="py-16">
            <p className="text-sm font-medium mb-1">No access requests</p>
            <p className="text-sm text-muted-foreground">
              {filter === "pending" 
                ? "New requests will appear here when submitted."
                : "No requests found."}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1.5fr_2fr_1fr_1fr_100px_80px] gap-4 pb-3 text-xs font-medium text-muted-foreground">
              <span>Name</span>
              <span>Email</span>
              <span>Company</span>
              <span>Type</span>
              <span>Submitted</span>
              <span className="text-right">Status</span>
            </div>

            {/* Rows */}
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/admin/access-requests/${request.id}`}
                className="block h-14 hover:bg-muted/[0.03] -mx-2 px-2 rounded-md transition-colors"
              >
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[1.5fr_2fr_1fr_1fr_100px_80px] gap-4 items-center w-full h-full">
                  <span className="text-sm font-medium truncate">{request.name || "—"}</span>
                  <span className="text-xs text-muted-foreground truncate">{request.email}</span>
                  <span className="text-xs text-muted-foreground truncate">{request.company || "—"}</span>
                  <span className="text-xs text-muted-foreground">
                    {request.company_type ? COMPANY_TYPE_LABELS[request.company_type] || request.company_type : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(request.created_at), "MMM d, yyyy")}
                  </span>
                  <span className="text-xs text-right capitalize text-muted-foreground">
                    {request.account_status}
                  </span>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex flex-col justify-center h-full gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{request.name || "—"}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {request.account_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {request.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), "MMM d")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
