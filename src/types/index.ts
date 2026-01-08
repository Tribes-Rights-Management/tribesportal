// Request status types - use string for database compatibility
export type RequestStatus = string;

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  needs_info: "Needs Info",
  approved: "Approved",
  awaiting_signature: "Awaiting Signature",
  awaiting_payment: "Awaiting Payment",
  sent_for_signature: "Sent for Signature",
  executed: "Executed",
  closed: "Closed",
  done: "Complete",
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  draft: "Your request has been saved but not yet submitted.",
  submitted: "Your request has been submitted and is awaiting review.",
  in_review: "Your request is currently being reviewed by our team.",
  needs_info: "Additional information is needed to process your request.",
  approved: "Your request has been approved.",
  awaiting_signature: "Please review and sign the license agreement.",
  awaiting_payment: "Please complete payment to finalize your license.",
  sent_for_signature: "The agreement has been sent for signature.",
  executed: "Your license has been executed.",
  closed: "This request has been closed.",
  done: "Your license is complete and active.",
};

// License request type
export interface LicenseRequest {
  id: string;
  user_id: string;
  status: RequestStatus;
  license_id?: string;
  package_reference?: string;
  
  // Requester info
  first_name?: string;
  last_name?: string;
  organization?: string;
  licensee_legal_name?: string;
  licensee_email?: string;
  
  // Address
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  
  // Product details
  label_master_owner?: string;
  distributor?: string;
  release_date?: string | null;
  recording_artist?: string;
  release_title?: string;
  product_upc?: string;
  additional_product_info?: string;
  
  // Track details
  track_title?: string;
  song_title?: string;
  track_artist?: string;
  track_isrc?: string;
  runtime?: string;
  appears_multiple_times?: boolean;
  times_count?: number | null;
  additional_track_info?: string;
  project_title?: string;
  
  // License types
  selected_license_types?: string[];
  
  // Agreements
  agreement_accounting?: boolean;
  agreement_terms?: boolean;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
}

// Wizard form data
export interface WizardFormData {
  agreement_accounting: boolean;
  agreement_terms: boolean;
  selected_license_types: string[];
  first_name: string;
  last_name: string;
  organization: string;
  licensee_email: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
  label_master_owner: string;
  distributor: string;
  release_date: string | null;
  recording_artist: string;
  release_title: string;
  product_upc: string;
  additional_product_info: string;
  track_title: string;
  track_artist: string;
  track_isrc: string;
  runtime: string;
  appears_multiple_times: boolean;
  times_count: number | null;
  additional_track_info: string;
}

export const DEFAULT_WIZARD_FORM: WizardFormData = {
  agreement_accounting: false,
  agreement_terms: false,
  selected_license_types: [],
  first_name: "",
  last_name: "",
  organization: "",
  licensee_email: "",
  address_street: "",
  address_city: "",
  address_state: "",
  address_zip: "",
  address_country: "United States",
  label_master_owner: "",
  distributor: "",
  release_date: null,
  recording_artist: "",
  release_title: "",
  product_upc: "",
  additional_product_info: "",
  track_title: "",
  track_artist: "",
  track_isrc: "",
  runtime: "",
  appears_multiple_times: false,
  times_count: null,
  additional_track_info: "",
};

// License type
export interface LicenseType {
  id: string;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  sort_order?: number;
}

// License (individual license within a package)
export interface License {
  id: string;
  license_id: string;
  request_id: string;
  license_type_code: string;
  status: RequestStatus;
  term?: string;
  territory?: string;
  fee?: string;
  is_superseded?: boolean;
  superseded_by?: string;
  created_at: string;
  updated_at: string;
}

// Status history
export interface StatusHistory {
  id: string;
  request_id: string;
  license_id?: string;
  from_status?: RequestStatus;
  to_status: RequestStatus;
  actor_user_id: string;
  notes?: string;
  created_at: string;
}

// Access request profile (extended profile for access requests)
export interface AccessRequestProfile {
  id: string;
  email: string;
  name?: string;
  display_name?: string;
  company?: string;
  company_type?: string;
  company_description?: string;
  country?: string;
  website?: string;
  phone?: string;
  account_status?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  action: string;
  actor_id: string;
  target_email?: string;
  details?: string;
  created_at: string;
}

// Internal note
export interface InternalNote {
  id: string;
  request_id: string;
  user_id: string;
  note: string;
  created_at: string;
}

// Generated document - matches database schema
export interface GeneratedDocument {
  id: string;
  request_id: string;
  document_type: string;
  file_url?: string | null;
  status?: string | null;
  created_at: string;
  updated_at?: string;
}

// Contact submission
export interface ContactSubmission {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  location: string;
  message: string;
  status: "new" | "in_review" | "follow_up_required" | "closed";
  source_page: string;
  admin_notes?: string;
  updated_at: string;
  updated_by?: string;
}
