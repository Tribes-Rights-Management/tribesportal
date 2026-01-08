import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { LicenseRequest, GeneratedDocument, STATUS_LABELS, STATUS_DESCRIPTIONS } from "@/types";
import { format } from "date-fns";
import { LicensePreviewModal } from "@/components/LicensePreviewModal";

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [request, setRequest] = useState<LicenseRequest | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) fetchRequestData(id);
  }, [id]);

  async function fetchRequestData(requestId: string) {
    try {
      const [requestRes, docsRes] = await Promise.all([
        supabase.from("license_packages").select("*").eq("id", requestId).single(),
        supabase.from("generated_documents").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
      ]);

      if (requestRes.error) throw requestRes.error;
      setRequest(requestRes.data);
      setDocuments(docsRes.data || []);
    } catch (error) {
      console.error("Error fetching request:", error);
      toast({ title: "Error", description: "Unable to load request", variant: "destructive" });
      navigate("/portal");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyLicenseId() {
    if (!request?.license_id) return;
    await navigator.clipboard.writeText(request.license_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function generateFilename(request: LicenseRequest): string {
    const licenseId = request.license_id || "DRAFT";
    const trackTitle = (request.track_title || request.song_title || "Untitled")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50);
    const date = format(new Date(), "yyyy-MM-dd");
    return `Tribes_License_${licenseId}_${trackTitle}_${date}.pdf`;
  }

  async function handleDownload() {
    if (!request || request.status !== "done") return;
    
    const executedDoc = documents.find(d => d.doc_type === "executed");
    if (!executedDoc) {
      toast({ title: "Document unavailable", description: "The executed agreement is not yet available.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(executedDoc.storage_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = generateFilename(request);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      toast({ title: "Download failed", description: "Unable to download the document.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl opacity-0" />
      </DashboardLayout>
    );
  }

  if (!request) return null;

  const canEdit = request.status === "needs_info";
  const showCompleteAction = request.status === "awaiting_signature" || request.status === "awaiting_payment";
  const canDownload = request.status === "done";
  
  const fullAddress = [
    request.address_street,
    request.address_city,
    request.address_state,
    request.address_zip,
    request.address_country,
  ].filter(Boolean).join(", ");

  const requesterName = [request.first_name, request.last_name].filter(Boolean).join(" ") || request.licensee_legal_name || "—";

  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-content-fade">
        {/* Back */}
        <Link
          to="/portal/licenses"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          Licenses
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <h1>{request.track_title || request.song_title || request.project_title || "Untitled"}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {STATUS_LABELS[request.status] || request.status}
          </p>
          <p className="text-xs text-muted-foreground">{STATUS_DESCRIPTIONS[request.status]}</p>
          
          {request.license_id && (
            <p 
              className="text-xs text-muted-foreground font-mono mt-3 cursor-pointer hover:text-foreground transition-colors inline-block"
              onClick={copyLicenseId}
              title="Copy to clipboard"
            >
              {request.license_id} {copied && "· Copied"}
            </p>
          )}
        </div>

        {/* Single Action */}
        {(canEdit || showCompleteAction || canDownload) && (
          <div className="mb-12">
            {canEdit && (
              <Link
                to={`/portal/request/${request.id}/edit`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Update information
              </Link>
            )}

            {showCompleteAction && (
              <Link
                to={`/portal/request/${request.id}/sign`}
                className="text-sm text-foreground hover:text-foreground/80 transition-colors"
              >
                Review and execute
              </Link>
            )}

            {canDownload && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                >
                  View agreement
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block disabled:opacity-50"
                >
                  {isDownloading ? "Downloading…" : "Download agreement"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Overview Section */}
        <div className="space-y-12">
          
          {/* Your Information */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Licensee Information</h2>
            <div className="space-y-3">
              <Field label="Name" value={requesterName} />
              <Field label="Organization" value={request.organization} />
              <Field label="Email" value={request.licensee_email} />
              {fullAddress && <Field label="Address" value={fullAddress} />}
            </div>
          </section>

          {/* License Information */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">License Details</h2>
            <div className="space-y-3">
              <Field label="License Type" value={request.license_type} />
              <Field label="Territory" value={request.territory} />
              <Field label="Term" value={request.term} />
              <Field label="License Fee" value={request.license_fee ? `$${request.license_fee.toLocaleString()} ${request.currency || "USD"}` : null} />
            </div>
          </section>

          {/* Product Details */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Product Details</h2>
            <div className="space-y-3">
              <Field label="Label / Master Owner" value={request.label_master_owner} />
              <Field label="Distributor" value={request.distributor} />
              <Field label="Recording Artist" value={request.recording_artist} />
              <Field label="Release Title" value={request.release_title} />
              <Field label="Release Date" value={request.release_date ? format(new Date(request.release_date), "MMMM d, yyyy") : null} />
              <Field label="UPC" value={request.product_upc} />
            </div>
            {request.additional_product_info && (
              <p className="text-sm text-muted-foreground pt-2">{request.additional_product_info}</p>
            )}
          </section>

          {/* Track Details */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Track Details</h2>
            <div className="space-y-3">
              <Field label="Track Title" value={request.track_title || request.song_title} />
              <Field label="Track Artist" value={request.track_artist} />
              <Field label="ISRC" value={request.track_isrc} />
              <Field label="Runtime" value={request.runtime} />
              <Field label="Multiple Uses" value={request.appears_multiple_times ? `Yes (${request.times_count || "—"})` : "No"} />
            </div>
            {request.additional_track_info && (
              <p className="text-sm text-muted-foreground pt-2">{request.additional_track_info}</p>
            )}
          </section>

          {/* Documents */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Documentation</h2>
            {documents.length === 0 && request.status !== "done" ? (
              <p className="text-sm text-muted-foreground">
                Executed agreement will appear here upon completion.
              </p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents on record.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="text-sm">
                    <p>
                      {doc.doc_type === "draft" ? "Draft Agreement" : "Executed Agreement"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.created_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Request Timeline */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Timeline</h2>
            <div className="space-y-3">
              <Field 
                label="Submitted" 
                value={request.submitted_at ? format(new Date(request.submitted_at), "MMMM d, yyyy 'at' h:mm a") : null} 
              />
              {request.signed_at && (
                <Field 
                  label="Signed" 
                  value={format(new Date(request.signed_at), "MMMM d, yyyy 'at' h:mm a")} 
                />
              )}
              {request.paid_at && (
                <Field 
                  label="Payment received" 
                  value={format(new Date(request.paid_at), "MMMM d, yyyy 'at' h:mm a")} 
                />
              )}
              {request.executed_at && (
                <Field 
                  label="Executed" 
                  value={format(new Date(request.executed_at), "MMMM d, yyyy 'at' h:mm a")} 
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && request && (
        <LicensePreviewModal
          request={request}
          onClose={() => setShowPreview(false)}
        />
      )}
    </DashboardLayout>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
