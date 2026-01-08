import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ContactStatus = "new" | "in_review" | "follow_up_required" | "closed";

interface ContactSubmission {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  location: string;
  message: string;
  status: ContactStatus;
  source_page: string;
  admin_notes: string | null;
  updated_at: string;
}

const statusLabels: Record<ContactStatus, string> = {
  new: "New",
  in_review: "In Review",
  follow_up_required: "Follow-up Required",
  closed: "Closed",
};

const statusColors: Record<ContactStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  follow_up_required: "bg-orange-50 text-orange-700 border-orange-200",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function AdminContactSubmissionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<ContactStatus | "">("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["contact-submissions", statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as ContactStatus);
      }

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: ContactStatus; admin_notes: string }) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ 
          status, 
          admin_notes, 
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      toast({ title: "Record updated" });
      setSelectedSubmission(null);
    },
    onError: () => {
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  const handleOpenDetail = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || "");
    setNewStatus(submission.status);
  };

  const handleSave = () => {
    if (!selectedSubmission || !newStatus) return;
    updateMutation.mutate({
      id: selectedSubmission.id,
      status: newStatus as ContactStatus,
      admin_notes: adminNotes,
    });
  };

  const handleCopyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    toast({ title: "Email copied" });
  };

  const newCount = submissions?.filter(s => s.status === "new").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contact Intake</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and triage inbound contact submissions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New{newCount > 0 ? ` (${newCount})` : ""}</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[160px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : submissions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions?.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleOpenDetail(submission)}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(submission.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">{submission.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{submission.email}</TableCell>
                    <TableCell className="text-muted-foreground">{submission.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[submission.status]}>
                        {statusLabels[submission.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5">Name</p>
                  <p className="font-medium">{selectedSubmission.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Email</p>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`mailto:${selectedSubmission.email}`} 
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyEmail(selectedSubmission.email);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Location</p>
                  <p className="font-medium">{selectedSubmission.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(selectedSubmission.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">Message</p>
                <div className="bg-muted/50 rounded-md p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Status</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ContactStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes…"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
