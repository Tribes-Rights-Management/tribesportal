
-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client documents
CREATE POLICY "Authenticated users can upload client documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can view client documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can delete client documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'client-documents');
