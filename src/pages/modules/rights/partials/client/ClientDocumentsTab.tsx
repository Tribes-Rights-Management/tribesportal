import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  PlatformButton,
  PlatformTable,
  PlatformTableHeader,
  PlatformTableBody,
  PlatformTableRow,
  PlatformTableHead,
  PlatformTableCell,
  PlatformTableEmpty,
  PlatformEmptyState,
} from "@/components/platform-ui";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ClientDocumentsTabProps {
  clientId: string;
}

export default function ClientDocumentsTab({ clientId }: ClientDocumentsTabProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["client-documents", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({ description: "File must be under 25MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${clientId}/${timestamp}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("client_documents")
        .insert({
          client_account_id: clientId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || null,
          document_type: "other",
        } as any);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["client-documents", clientId] });
      toast({ description: "Document uploaded" });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ description: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (doc: any) => {
      await supabase.storage.from("client-documents").remove([doc.file_path]);
      const { error } = await supabase.from("client_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-documents", clientId] });
      toast({ description: "Document deleted" });
    },
    onError: () => {
      toast({ description: "Failed to delete document", variant: "destructive" });
    },
  });

  const handleDownload = async (doc: any) => {
    const { data } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast({ description: "Failed to generate download link", variant: "destructive" });
    }
  };

  return (
    <div>
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6 cursor-pointer hover:border-muted-foreground/40 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-1">
          {uploading ? "Uploading..." : "Click to upload a document"}
        </p>
        <p className="text-xs text-muted-foreground/60">PDF, DOCX, PNG, JPG up to 25MB</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      {/* Documents table */}
      {isLoading ? (
        <PlatformEmptyState message="Loading documents..." size="lg" />
      ) : (
        <PlatformTable columns={["35%", "20%", "20%", "15%", "10%"]}>
          <PlatformTableHeader>
            <PlatformTableRow header>
              <PlatformTableHead>Name</PlatformTableHead>
              <PlatformTableHead>Type</PlatformTableHead>
              <PlatformTableHead>Uploaded</PlatformTableHead>
              <PlatformTableHead>Size</PlatformTableHead>
              <PlatformTableHead align="right">Actions</PlatformTableHead>
            </PlatformTableRow>
          </PlatformTableHeader>
          <PlatformTableBody>
            {documents.length === 0 ? (
              <PlatformTableEmpty colSpan={5}>
                <span className="text-sm text-muted-foreground">No documents uploaded</span>
              </PlatformTableEmpty>
            ) : (
              documents.map((doc: any) => (
                <PlatformTableRow key={doc.id}>
                  <PlatformTableCell>{doc.file_name}</PlatformTableCell>
                  <PlatformTableCell muted>{doc.document_type?.replace("_", " ") || "other"}</PlatformTableCell>
                  <PlatformTableCell muted>
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </PlatformTableCell>
                  <PlatformTableCell muted>
                    {doc.file_size ? formatFileSize(doc.file_size) : "—"}
                  </PlatformTableCell>
                  <PlatformTableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <PlatformButton intent="ghost" size="xs" onClick={() => handleDownload(doc)}>
                        <Download className="h-3.5 w-3.5" />
                      </PlatformButton>
                      <PlatformButton
                        intent="ghost"
                        size="xs"
                        onClick={() => deleteMutation.mutate(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </PlatformButton>
                    </div>
                  </PlatformTableCell>
                </PlatformTableRow>
              ))
            )}
          </PlatformTableBody>
        </PlatformTable>
      )}
    </div>
  );
}
