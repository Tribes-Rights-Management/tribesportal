import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardBody,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * CLIENT PORTAL MODULE — DOCUMENTS
 * 
 * Route: /portal/documents
 * Permission: portal.view
 */
export default function PortalDocumentsPage() {
  return (
    <PageContainer maxWidth="wide">
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          <AppPageHeader 
            eyebrow="PORTAL"
            title="Documents"
            description="Contracts, tax forms, and reference materials"
          />
          
          <div className="mt-8">
            <AppEmptyState
              icon="file"
              message="No documents available"
              description="Documents will appear once uploaded or generated."
            />
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}
