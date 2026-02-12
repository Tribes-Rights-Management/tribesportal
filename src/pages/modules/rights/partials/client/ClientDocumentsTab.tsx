import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AppButton,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppEmptyState,
} from "@/components/app-ui";

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
        <AppEmptyState message="Loading documents..." size="lg" />
      ) : (
        <AppTable columns={["35%", "20%", "20%", "15%", "10%"]}>
          <AppTableHeader>
            <AppTableRow header>
              <AppTableHead>Name</AppTableHead>
              <AppTableHead>Type</AppTableHead>
              <AppTableHead>Uploaded</AppTableHead>
              <AppTableHead>Size</AppTableHead>
              <AppTableHead align="right">Actions</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {documents.length === 0 ? (
              <AppTableEmpty colSpan={5}>
                <span className="text-sm text-muted-foreground">No documents uploaded</span>
              </AppTableEmpty>
            ) : (
              documents.map((doc: any) => (
                <AppTableRow key={doc.id}>
                  <AppTableCell>{doc.file_name}</AppTableCell>
                  <AppTableCell muted>{doc.document_type?.replace("_", " ") || "other"}</AppTableCell>
                  <AppTableCell muted>
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </AppTableCell>
                  <AppTableCell muted>
                    {doc.file_size ? formatFileSize(doc.file_size) : "—"}
                  </AppTableCell>
                  <AppTableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <AppButton intent="ghost" size="xs" onClick={() => handleDownload(doc)}>
                        <Download className="h-3.5 w-3.5" />
                      </AppButton>
                      <AppButton
                        intent="ghost"
                        size="xs"
                        onClick={() => deleteMutation.mutate(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </AppButton>
                    </div>
                  </AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      )}
    </div>
  );
}
