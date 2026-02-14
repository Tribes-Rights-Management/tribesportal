/**
 * DATA ROOM PAGE — System Console
 * 
 * Formal, immutable disclosure packages for audits,
 * diligence, and compliance requests.
 */

import { useState } from "react";
import { format } from "date-fns";
import { 
  FileArchive, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Users,
  Eye
} from "lucide-react";
import { AppPageLayout } from "@/components/app-ui";
import { ConsoleButton, ConsoleChip } from "@/components/console";
import { AppTable, AppTableHeader, AppTableBody, AppTableHead, AppTableRow, AppTableCell, AppTableEmpty } from "@/components/app-ui/AppTable";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
} from "@/components/ui/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { 
  useDataRoomExports, 
  useCreateDataRoomExport,
  EXPORT_TYPE_LABELS,
  EXPORT_TYPE_DESCRIPTIONS,
  DataRoomExportType,
} from "@/hooks/useDataRoomExports";

import { useRoleAccess } from "@/hooks/useRoleAccess";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "generating":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "generating":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE EXPORT DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface CreateExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateExportDialog({ open, onOpenChange }: CreateExportDialogProps) {
  const [exportType, setExportType] = useState<DataRoomExportType>("billing_payments");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scopeType, setScopeType] = useState<"platform" | "organization">("platform");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  
  const createExport = useCreateDataRoomExport();

  const handleCreate = async () => {
    if (!title.trim() || !periodStart || !periodEnd) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createExport.mutateAsync({
        exportType,
        title: title.trim(),
        description: description.trim() || undefined,
        scopeType,
        periodStart,
        periodEnd,
      });
      
      toast.success("Export request submitted");
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPeriodStart("");
      setPeriodEnd("");
    } catch (error) {
      toast.error("Failed to create export request");
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Data Room Export"
      description="Generate a formal, immutable disclosure package for audits or compliance."
      maxWidth="lg"
    >
      <AppModalBody>
        <div className="space-y-4">
          {/* Export Type */}
          <div className="space-y-2">
            <Label>Export Type</Label>
            <Select value={exportType} onValueChange={(v) => setExportType(v as DataRoomExportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPORT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[12px] text-muted-foreground">
              {EXPORT_TYPE_DESCRIPTIONS[exportType]}
            </p>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Label>Export Title</Label>
            <Input
              placeholder="e.g., Q4 2025 Audit Pack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Purpose of this export..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          {/* Scope */}
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={scopeType} onValueChange={(v) => setScopeType(v as "platform" | "organization")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Platform-wide</SelectItem>
                <SelectItem value="organization">Single Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
          
          {/* Disclosure Warning */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-[12px] text-muted-foreground">
              <strong>Important:</strong> This export will be logged and watermarked. 
              It cannot be modified once generated. All access will be tracked.
            </p>
          </div>
        </div>
      </AppModalBody>
      
      <AppModalFooter>
        <ConsoleButton intent="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </ConsoleButton>
        <ConsoleButton onClick={handleCreate} disabled={createExport.isPending}>
          {createExport.isPending ? "Creating..." : "Create Export"}
        </ConsoleButton>
      </AppModalFooter>
    </AppModal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DataRoomPage() {
  const { data: exports, isLoading } = useDataRoomExports();
  const { isPlatformAdmin } = useRoleAccess();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!isPlatformAdmin) {
    return (
      <AppPageLayout title="Access Denied">
        <p className="text-muted-foreground">
          You do not have permission to access the data room.
        </p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Data Room"
      action={
        <ConsoleButton onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Export
        </ConsoleButton>
      }
    >

      {/* Info Card */}
      <div 
        className="p-4 rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <div className="flex items-start gap-3">
          <FileArchive className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[13px] font-medium text-[--platform-text]">
              Controlled Disclosure
            </h3>
            <p className="text-[12px] text-muted-foreground mt-1">
              Data room exports are formal, immutable packages designed for audits, 
              due diligence, and compliance requests. Each export is watermarked, 
              logged, and access-tracked. Exports cannot be modified once generated.
            </p>
          </div>
        </div>
      </div>

      {/* Exports Table - with horizontal scroll for mobile */}
      <div 
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        {isLoading ? (
          <div className="p-6">
            <InstitutionalLoadingState message="Loading exports..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <AppTable columns={["22%", "18%", "12%", "16%", "12%", "12%", "8%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Export</AppTableHead>
                <AppTableHead>Type</AppTableHead>
                <AppTableHead>Scope</AppTableHead>
                <AppTableHead>Period</AppTableHead>
                <AppTableHead>Status</AppTableHead>
                <AppTableHead>Created</AppTableHead>
                <AppTableHead>Actions</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {(exports || []).length === 0 ? (
                <AppTableEmpty colSpan={7}>
                  <FileArchive className="h-6 w-6 text-muted-foreground mx-auto mb-2" strokeWidth={1.0} />
                  <p className="text-[13px] text-muted-foreground">
                    No exports created yet
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Create your first export package for audits or compliance
                  </p>
                </AppTableEmpty>
              ) : (
                (exports || []).map((exp) => (
                  <AppTableRow key={exp.id}>
                    <AppTableCell>
                      <div>
                        <p className="text-[13px] font-medium text-[--platform-text]">
                          {exp.title}
                        </p>
                        {exp.description && (
                          <p className="text-[12px] text-muted-foreground line-clamp-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </AppTableCell>
                    <AppTableCell>
                      <span className="text-[12px] text-[--platform-text]">
                        {EXPORT_TYPE_LABELS[exp.export_type]}
                      </span>
                    </AppTableCell>
                    <AppTableCell>
                      <ConsoleChip label={exp.scope_type} className="text-[10px]" />
                    </AppTableCell>
                    <AppTableCell>
                      <span className="text-[12px] text-muted-foreground">
                        {format(new Date(exp.period_start), "MMM d")} — {format(new Date(exp.period_end), "MMM d, yyyy")}
                      </span>
                    </AppTableCell>
                    <AppTableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exp.status)}
                        <ConsoleChip 
                          status={exp.status === "completed" ? "pass" : exp.status === "failed" ? "fail" : "running"} 
                          label={exp.status}
                          className="text-[10px]" 
                        />
                      </div>
                    </AppTableCell>
                    <AppTableCell>
                      <span className="text-[12px] text-muted-foreground">
                        {format(new Date(exp.created_at), "MMM d, yyyy")}
                      </span>
                    </AppTableCell>
                    <AppTableCell>
                      <div className="flex items-center gap-1">
                        <ConsoleButton
                          intent="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={exp.status !== "completed"}
                        >
                          <Eye className="h-4 w-4" />
                        </ConsoleButton>
                        <ConsoleButton
                          intent="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={exp.status !== "completed" || !exp.file_url}
                        >
                          <Download className="h-4 w-4" />
                        </ConsoleButton>
                        <ConsoleButton
                          intent="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Users className="h-4 w-4" />
                        </ConsoleButton>
                      </div>
                    </AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
          </div>
        )}
      </div>

      {/* Create Export Dialog */}
      <CreateExportDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </AppPageLayout>
  );
}
