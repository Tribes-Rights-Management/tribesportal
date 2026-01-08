import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LicenseRequest, License, StatusHistory, GeneratedDocument, RequestStatus, STATUS_LABELS } from "@/types";
import { format } from "date-fns";
import { LicensePreviewModal } from "@/components/LicensePreviewModal";
import { 
  StatusChangeNote, 
  ViewOnlyMessage, 
  AuditLogHeader,
  ApprovalConfirmModal,
  SupersedeConfirmModal,
  ExportWarning,
  EditBlockModal
} from "@/components/admin/AdminGuardrails";

interface InternalNote {
  id: string;
  note: string;
  user_id: string;
  created_at: string;
}

interface LicenseType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const WORKFLOW_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  draft: [],
  submitted: ["in_review", "needs_info"],
  in_review: ["approved", "needs_info"],
  needs_info: ["in_review"],
  approved: ["awaiting_signature"],
  sent_for_signature: ["awaiting_payment", "done"],
  awaiting_signature: ["awaiting_payment", "done"],
  awaiting_payment: ["done"],
  executed: ["done"],
  closed: [],
  done: [],
};

const LICENSE_STATUS_ORDER: RequestStatus[] = [
  "submitted",
  "in_review", 
  "needs_info",
  "approved",
  "awaiting_signature",
  "awaiting_payment",
  "done",
];

function getDerivedPackageStatus(licenses: License[]): RequestStatus | null {
  // C5: Exclude superseded licenses from derived status calculation
  const activeLicenses = licenses.filter(l => !(l as any).is_superseded);
  if (activeLicenses.length === 0) return null;
  
  let lowestIndex = LICENSE_STATUS_ORDER.length - 1;
  for (const license of activeLicenses) {
    const idx = LICENSE_STATUS_ORDER.indexOf(license.status);
    if (idx !== -1 && idx < lowestIndex) {
      lowestIndex = idx;
    }
  }
  return LICENSE_STATUS_ORDER[lowestIndex];
}

export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const { user, isSuperAdmin, isAdminView } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [request, setRequest] = useState<LicenseRequest | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingLicenses, setIsGeneratingLicenses] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedLicenseForStatus, setSelectedLicenseForStatus] = useState<string | null>(null);
  const [supersedingLicenseId, setSupersedingLicenseId] = useState<string | null>(null);
  const [supersessionReason, setSupersessionReason] = useState("");
  const [isSuperseding, setIsSuperseding] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [showEditBlockModal, setShowEditBlockModal] = useState(false);
  const [showSupersedeModal, setShowSupersedeModal] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchRequestData(id);
  }, [id]);

  async function fetchRequestData(requestId: string) {
    try {
      const [requestRes, licensesRes, historyRes, docsRes, notesRes, typesRes] = await Promise.all([
        supabase.from("license_packages").select("*").eq("id", requestId).single(),
        supabase.from("licenses").select("*").eq("request_id", requestId).order("created_at"),
        supabase.from("status_history").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
        supabase.from("generated_documents").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
        supabase.from("internal_notes").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
        supabase.from("license_types").select("*").eq("is_active", true).order("sort_order"),
      ]);

      if (requestRes.error) throw requestRes.error;
      setRequest(requestRes.data);
      setLicenses(licensesRes.data || []);
      setHistory(historyRes.data || []);
      setDocuments(docsRes.data || []);
      setNotes(notesRes.data || []);
      setLicenseTypes(typesRes.data || []);
    } catch (error) {
      console.error("Error fetching request:", error);
      toast({ title: "Error", description: "Failed to load request", variant: "destructive" });
      navigate("/admin");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateLicenseStatus(licenseId: string, newStatus: RequestStatus) {
    if (!request || !user || !isSuperAdmin) return;
    
    const license = licenses.find(l => l.id === licenseId);
    if (!license) return;
    
    setIsUpdating(true);
    try {
      await supabase.from("licenses").update({ status: newStatus }).eq("id", licenseId);
      await supabase.from("status_history").insert({
        request_id: request.id,
        license_id: licenseId,
        from_status: license.status,
        to_status: newStatus,
        actor_user_id: user.id,
      });
      toast({ title: "License status updated" });
      setSelectedLicenseForStatus(null);
      fetchRequestData(request.id);
    } catch (error) {
      console.error("Error updating license status:", error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  }

  async function addNote() {
    if (!request || !user || !isSuperAdmin || !newNote.trim()) return;
    
    setIsAddingNote(true);
    try {
      await supabase.from("internal_notes").insert({
        request_id: request.id,
        user_id: user.id,
        note: newNote.trim(),
      });
      setNewNote("");
      fetchRequestData(request.id);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "Failed to add note", variant: "destructive" });
    } finally {
      setIsAddingNote(false);
    }
  }

  async function copyId(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function generateLicenses() {
    if (!request || !user || !isSuperAdmin) return;
    
    setIsGeneratingLicenses(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-licenses", {
        body: { request_id: request.id },
      });

      if (error) throw error;
      
      toast({ title: "Licenses generated", description: `${data.licenses?.length || 0} licenses created` });
      fetchRequestData(request.id);
    } catch (error) {
      console.error("Error generating licenses:", error);
      toast({ title: "Error", description: "Failed to generate licenses", variant: "destructive" });
    } finally {
      setIsGeneratingLicenses(false);
    }
  }

  async function supersedeLicense(licenseIdHuman: string) {
    if (!request || !user || !isSuperAdmin || !supersessionReason.trim()) return;
    
    setIsSuperseding(true);
    try {
      // Supersede functionality would be implemented via edge function
      toast({ 
        title: "Coming soon", 
        description: "License supersession will be available soon"
      });
      setSupersedingLicenseId(null);
      setSupersessionReason("");
    } catch (error: any) {
      console.error("Error superseding license:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to supersede license", 
        variant: "destructive" 
      });
    } finally {
      setIsSuperseding(false);
    }
  }

  const selectedTypeNames = (request?.selected_license_types || [])
    .map(code => licenseTypes.find(t => t.code === code)?.name || code);
  const canGenerateLicenses = request && isSuperAdmin && 
    ["in_review", "approved"].includes(request.status) && 
    licenses.length === 0 && 
    (request.selected_license_types?.length || 0) > 0;
  
  // Separate active and superseded licenses
  const activeLicenses = licenses.filter(l => !(l as any).is_superseded);
  const supersededLicenses = licenses.filter(l => (l as any).is_superseded);
  
  const derivedPackageStatus = getDerivedPackageStatus(licenses);
  const hasMultipleLicenses = activeLicenses.length > 1;
  
  // D1: Check if export is allowed (all active licenses done)
  const canExport = activeLicenses.length > 0 && activeLicenses.every(l => l.status === "done");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl opacity-0" />
      </DashboardLayout>
    );
  }

  if (!request) return null;

  const requesterName = [request.first_name, request.last_name].filter(Boolean).join(" ") || request.licensee_legal_name || "—";
  const fullAddress = [request.address_street, request.address_city, request.address_state, request.address_zip, request.address_country].filter(Boolean).join(", ");

  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-content-fade">
        {/* Back */}
        <button
          onClick={() => navigate("/admin")}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          ← Dashboard
        </button>

        {/* Header with Package ID */}
        <div className="mb-12">
          {request.package_reference && (
            <div className="mb-4">
              <p className="text-[12px] text-muted-foreground mb-1">Package ID</p>
              <p 
                className="text-[15px] font-mono cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={() => copyId(request.package_reference!)}
                title="Click to copy"
              >
                {request.package_reference} {copied && "· Copied"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">System-generated. Not editable.</p>
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-2">
            {derivedPackageStatus && licenses.length > 0 ? (
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={derivedPackageStatus} />
                  <span className="text-[11px] text-muted-foreground">Package Status (Derived)</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Calculated from the lowest-status license in this package.
                </p>
              </div>
            ) : (
              <StatusBadge status={request.status} />
            )}
            {isAdminView && <span className="text-[12px] text-muted-foreground">View only</span>}
          </div>
        </div>

        {/* View-Only Warning for admin_view role */}
        {isAdminView && !isSuperAdmin && (
          <div className="mb-8">
            <ViewOnlyMessage />
          </div>
        )}

        {/* Single-column reading layout */}
        <div className="space-y-12">
          
          {/* Active Licenses */}
          {activeLicenses.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Active Licenses ({activeLicenses.length})
              </h3>
              
              {hasMultipleLicenses && (
                <div className="py-3 px-4 bg-muted/30 rounded text-[12px] text-muted-foreground leading-relaxed">
                  <p>This package contains multiple independent licenses.</p>
                  <p className="mt-1">Each license is governed by its own License ID and terms.</p>
                </div>
              )}
              
              <div className="space-y-6 mt-4">
                {activeLicenses.map(license => {
                  const typeName = licenseTypes.find(t => t.code === license.license_type_code)?.name || license.license_type_code;
                  const allowedTransitions = WORKFLOW_TRANSITIONS[license.status] || [];
                  const isExpanded = selectedLicenseForStatus === license.id;
                  const isSupersedingThis = supersedingLicenseId === license.license_id;
                  const canSupersede = license.status === "done" && isSuperAdmin;
                  
                  return (
                    <div key={license.id} className="py-4 border-b border-border/30 last:border-0">
                      {/* License ID - Prominent */}
                      <div className="mb-3">
                        <p className="text-[12px] text-muted-foreground mb-0.5">License ID</p>
                        <p 
                          className="text-[14px] font-mono cursor-pointer hover:text-muted-foreground transition-colors"
                          onClick={() => copyId(license.license_id)}
                          title="Click to copy"
                        >
                          {license.license_id}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">System-generated. Not editable.</p>
                      </div>
                      
                      {/* License Type */}
                      <div className="mb-3">
                        <p className="text-[12px] text-muted-foreground mb-0.5">License Type</p>
                        <p className="text-[14px]">{typeName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">System-generated. Not editable.</p>
                      </div>
                      
                      {/* Status with controls */}
                      <div className="mb-3">
                        <p className="text-[12px] text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={license.status} />
                          
                          {isSuperAdmin && allowedTransitions.length > 0 && (
                            <button
                              onClick={() => setSelectedLicenseForStatus(isExpanded ? null : license.id)}
                              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isExpanded ? "Cancel" : "Change status"}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Status change controls */}
                      {isSuperAdmin && isExpanded && allowedTransitions.length > 0 && (
                        <div className="mt-4 py-3 px-4 bg-muted/20 rounded space-y-3">
                          <p className="text-[12px] text-muted-foreground">
                            This action applies only to License ID {license.license_id}.
                          </p>
                          
                          <Select 
                            onValueChange={(v) => {
                              // If transitioning to approved, show confirmation modal
                              if (v === "approved") {
                                setShowApprovalModal(license.id);
                              } else {
                                updateLicenseStatus(license.id, v as RequestStatus);
                              }
                            }} 
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-48 h-9">
                              <SelectValue placeholder="Select new status…" />
                            </SelectTrigger>
                            <SelectContent>
                              {allowedTransitions.map(s => (
                                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <StatusChangeNote />
                          
                          {allowedTransitions.includes("done") && (
                            <p className="text-[11px] text-muted-foreground">
                              Marking this license as Done does not complete the entire package unless all licenses are Done.
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Additional license details */}
                      {(license.term || license.territory || license.fee) && (
                        <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                          {license.term && (
                            <div className="flex justify-between text-[13px]">
                              <span className="text-muted-foreground">Term</span>
                              <span>{license.term}</span>
                            </div>
                          )}
                          {license.territory && (
                            <div className="flex justify-between text-[13px]">
                              <span className="text-muted-foreground">Territory</span>
                              <span>{license.territory}</span>
                            </div>
                          )}
                          {license.fee && (
                            <div className="flex justify-between text-[13px]">
                              <span className="text-muted-foreground">Fee</span>
                              <span>${license.fee}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* F1/F2: Supersede action for executed licenses */}
                      {canSupersede && (
                        <div className="mt-4 pt-3 border-t border-border/20">
                          <button
                            onClick={() => setShowSupersedeModal(license.license_id)}
                            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Issue superseding license
                          </button>
                        </div>
                      )}
                      
                      {/* Helper text for license context */}
                      <p className="text-[11px] text-muted-foreground mt-4">
                        This license is part of a License Package.
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Changes to this license affect only the License ID shown above.
                      </p>
                    </div>
                  );
                })}
                
              </div>
            </section>
          )}

          {/* Superseded Licenses (F2: remains readable) */}
          {supersededLicenses.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Superseded Licenses ({supersededLicenses.length})
              </h3>
              <p className="text-[11px] text-muted-foreground">
                These licenses have been superseded and are read-only. They remain downloadable for historical reference.
              </p>
              
              <div className="space-y-4 mt-2">
                {supersededLicenses.map(license => {
                  const typeName = licenseTypes.find(t => t.code === license.license_type_code)?.name || license.license_type_code;
                  const supersededByLicense = licenses.find(l => l.id === (license as any).superseded_by);
                  
                  return (
                    <div key={license.id} className="py-3 px-4 bg-muted/20 rounded opacity-70">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[13px] font-mono">{license.license_id}</p>
                          <p className="text-[12px] text-muted-foreground">{typeName}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground px-2 py-0.5 border border-muted-foreground/30 rounded">
                          Superseded
                        </span>
                      </div>
                      {supersededByLicense && (
                        <p className="text-[11px] text-muted-foreground">
                          Superseded by: {supersededByLicense.license_id}
                        </p>
                      )}
                      {(license as any).supersession_reason && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Reason: {(license as any).supersession_reason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Admin Controls - Generate Licenses */}
          {(isSuperAdmin || isAdminView) && (
            <section className="space-y-6">
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Admin Actions</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted-foreground mb-1.5">Selected License Types</p>
                  {selectedTypeNames.length > 0 ? (
                    <div className="space-y-1">
                      {selectedTypeNames.map((name, i) => (
                        <p key={i} className="text-[14px]">{name}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-muted-foreground">None selected</p>
                  )}
                </div>

                {canGenerateLicenses && (
                  <div className="pt-2">
                    <button
                      onClick={generateLicenses}
                      disabled={isGeneratingLicenses}
                      className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingLicenses ? "Generating…" : "Generate individual licenses"}
                    </button>
                  </div>
                )}

                {isSuperAdmin && activeLicenses.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      disabled={!canExport}
                      className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Export license package
                    </button>
                    <ExportWarning canExport={canExport} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Summary */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Summary</h3>
            <div className="space-y-3">
              <Field label="Requester" value={requesterName} />
              <Field label="Organization" value={request.organization} />
              <Field label="Email" value={request.licensee_email} />
              <Field label="Submitted" value={request.submitted_at ? format(new Date(request.submitted_at), "MMMM d, yyyy") : null} />
            </div>
          </section>

          {/* Agreements */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Agreements</h3>
            <div className="space-y-2 text-[14px]">
              <p className={request.agreement_terms ? "text-foreground" : "text-muted-foreground"}>
                {request.agreement_terms ? "✓" : "○"} Terms accepted
              </p>
              <p className={request.agreement_accounting ? "text-foreground" : "text-muted-foreground"}>
                {request.agreement_accounting ? "✓" : "○"} Accounting accepted
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Contact</h3>
            <div className="space-y-3">
              <Field label="Name" value={requesterName} />
              <Field label="Email" value={request.licensee_email} />
              <Field label="Organization" value={request.organization} />
              {fullAddress && <Field label="Address" value={fullAddress} />}
            </div>
          </section>

          {/* Product */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Product</h3>
            <div className="space-y-3">
              <Field label="Label / Master Owner" value={request.label_master_owner} />
              <Field label="Distributor" value={request.distributor} />
              <Field label="Recording Artist" value={request.recording_artist} />
              <Field label="Release Title" value={request.release_title} />
              <Field label="Release Date" value={request.release_date ? format(new Date(request.release_date), "MMMM d, yyyy") : null} />
              <Field label="UPC" value={request.product_upc} />
            </div>
            {request.additional_product_info && (
              <p className="text-[13px] text-muted-foreground pt-2">{request.additional_product_info}</p>
            )}
          </section>

          {/* Track */}
          <section className="space-y-4">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Track</h3>
            <div className="space-y-3">
              <Field label="Title" value={request.track_title || request.song_title} />
              <Field label="Artist" value={request.track_artist} />
              <Field label="ISRC" value={request.track_isrc} />
              <Field label="Runtime" value={request.runtime} />
              <Field label="Multiple Uses" value={request.appears_multiple_times ? `Yes (${request.times_count || "?"})` : "No"} />
            </div>
            {request.additional_track_info && (
              <p className="text-[13px] text-muted-foreground pt-2">{request.additional_track_info}</p>
            )}
          </section>

          {/* Documents */}
          {documents.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Documents</h3>
              <div className="space-y-2">
                {documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.file_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {doc.document_type === "draft" ? "Draft" : "Executed"} — {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Notes (Admin only) */}
          {(isSuperAdmin || isAdminView) && (
            <section className="space-y-4">
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Notes</h3>
              
              {isSuperAdmin && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note…"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                  />
                  <div className="text-right">
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim() || isAddingNote}
                      className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                    >
                      Add note
                    </button>
                  </div>
                </div>
              )}

              {notes.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {notes.map(n => (
                    <div key={n.id}>
                      <p className="text-[14px]">{n.note}</p>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        {format(new Date(n.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground">No notes yet.</p>
              )}
            </section>
          )}

          {/* History */}
          {history.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">History</h3>
              <AuditLogHeader />
              <div className="space-y-2">
                {history.slice(0, 10).map(h => {
                  const licenseRef = h.license_id ? licenses.find(l => l.id === h.license_id)?.license_id : null;
                  return (
                    <p key={h.id} className="text-[13px] text-muted-foreground">
                      {format(new Date(h.created_at), "MMM d, yyyy")} — 
                      {licenseRef && <span className="font-mono"> {licenseRef}:</span>}
                      {h.from_status ? ` ${STATUS_LABELS[h.from_status]} → ` : " "}
                      {STATUS_LABELS[h.to_status]}
                    </p>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <LicensePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        request={request}
      />

      {/* Approval Confirmation Modal */}
      <ApprovalConfirmModal
        open={!!showApprovalModal}
        onClose={() => setShowApprovalModal(null)}
        onConfirm={() => {
          if (showApprovalModal) {
            updateLicenseStatus(showApprovalModal, "approved");
            setShowApprovalModal(null);
          }
        }}
        licenseId={showApprovalModal || ""}
        isProcessing={isUpdating}
      />

      {/* Supersede Confirmation Modal */}
      <SupersedeConfirmModal
        open={!!showSupersedeModal}
        onClose={() => setShowSupersedeModal(null)}
        onConfirm={() => {
          if (showSupersedeModal) {
            supersedeLicense(showSupersedeModal);
            setShowSupersedeModal(null);
          }
        }}
        isProcessing={isSuperseding}
        licenseId={showSupersedeModal || undefined}
      />

      {/* Edit Block Modal */}
      <EditBlockModal
        open={showEditBlockModal}
        onClose={() => setShowEditBlockModal(false)}
      />
    </DashboardLayout>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-[14px] mt-0.5">{value}</p>
    </div>
  );
}
