-- ==============================================
-- Full Migration for Tribes Rights Licensing Platform
-- ==============================================

-- Add additional columns to profiles table for access requests
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS company_type text,
ADD COLUMN IF NOT EXISTS company_description text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- ==============================================
-- License Types Table
-- ==============================================
CREATE TABLE IF NOT EXISTS public.license_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.license_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "License types are viewable by authenticated users"
  ON public.license_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage license types"
  ON public.license_types FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- License Packages Table (main requests table)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.license_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_reference text UNIQUE,
  license_id text,
  status text NOT NULL DEFAULT 'draft',
  
  -- Requester info
  first_name text,
  last_name text,
  organization text,
  licensee_legal_name text,
  licensee_email text,
  
  -- Address
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'United States',
  
  -- Product details
  label_master_owner text,
  distributor text,
  release_date date,
  recording_artist text,
  release_title text,
  product_upc text,
  additional_product_info text,
  
  -- Track details
  track_title text,
  song_title text,
  track_artist text,
  track_isrc text,
  runtime text,
  appears_multiple_times boolean DEFAULT false,
  times_count integer,
  additional_track_info text,
  project_title text,
  
  -- License types (array of codes)
  selected_license_types text[],
  
  -- Agreements
  agreement_accounting boolean DEFAULT false,
  agreement_terms boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_at timestamptz
);

ALTER TABLE public.license_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own packages"
  ON public.license_packages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own packages"
  ON public.license_packages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft packages"
  ON public.license_packages FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Admins can view all packages"
  ON public.license_packages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all packages"
  ON public.license_packages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- Licenses Table (individual licenses in a package)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id text UNIQUE NOT NULL,
  request_id uuid NOT NULL REFERENCES public.license_packages(id) ON DELETE CASCADE,
  license_type_code text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  term text,
  territory text,
  fee text,
  is_superseded boolean DEFAULT false,
  superseded_by text,
  supersession_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.license_packages 
      WHERE license_packages.id = licenses.request_id 
      AND license_packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all licenses"
  ON public.licenses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage licenses"
  ON public.licenses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- Status History Table
-- ==============================================
CREATE TABLE IF NOT EXISTS public.status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.license_packages(id) ON DELETE CASCADE,
  license_id uuid REFERENCES public.licenses(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  actor_user_id uuid NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own status history"
  ON public.status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.license_packages 
      WHERE license_packages.id = status_history.request_id 
      AND license_packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all status history"
  ON public.status_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create status history"
  ON public.status_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- Internal Notes Table
-- ==============================================
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.license_packages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all internal notes"
  ON public.internal_notes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create internal notes"
  ON public.internal_notes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- Generated Documents Table
-- ==============================================
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.license_packages(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON public.generated_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.license_packages 
      WHERE license_packages.id = generated_documents.request_id 
      AND license_packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents"
  ON public.generated_documents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage documents"
  ON public.generated_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- Contact Submissions Table
-- ==============================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  location text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  source_page text,
  admin_notes text,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert contact submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- Audit Log Table
-- ==============================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid NOT NULL,
  target_id uuid,
  target_email text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- Triggers for updated_at
-- ==============================================
CREATE TRIGGER update_license_types_updated_at
  BEFORE UPDATE ON public.license_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_license_packages_updated_at
  BEFORE UPDATE ON public.license_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- Seed some default license types
-- ==============================================
INSERT INTO public.license_types (code, name, description, sort_order) VALUES
  ('mechanical', 'Mechanical License', 'Permission to reproduce and distribute a copyrighted song', 1),
  ('sync', 'Synchronization License', 'Permission to sync music with visual media', 2),
  ('master', 'Master Use License', 'Permission to use a specific sound recording', 3),
  ('print', 'Print License', 'Permission to reproduce lyrics or sheet music', 4)
ON CONFLICT (code) DO NOTHING;