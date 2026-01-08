import { DashboardLayout } from "@/components/DashboardLayout";

export default function DataRetentionPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-content-fade">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-1">Data Retention</h1>
          <p className="text-sm text-muted-foreground">
            Information about how your data is stored and retained.
          </p>
        </div>

        <div className="space-y-12">
          {/* License Records */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">License Records</h2>
            <div className="text-sm space-y-2">
              <p>
                All license agreements and related documents are retained indefinitely as part of our 
                legal obligation to maintain accurate records of licensing transactions.
              </p>
              <p className="text-muted-foreground">
                This includes executed agreements, payment records, signature timestamps, and 
                correspondence related to license requests.
              </p>
            </div>
          </section>

          {/* Account Information */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Account Information</h2>
            <div className="text-sm space-y-2">
              <p>
                Your account information, including name, email address, and company details, is 
                retained for as long as your account remains active.
              </p>
              <p className="text-muted-foreground">
                This data is necessary for the administration of your licenses and for communication 
                regarding your licensing activity.
              </p>
            </div>
          </section>

          {/* Access Requests */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Access Requests</h2>
            <div className="text-sm space-y-2">
              <p>
                Records of access requests, including approved and declined requests, are retained 
                for audit and compliance purposes.
              </p>
              <p className="text-muted-foreground">
                This ensures we maintain a complete record of access decisions and can respond to 
                inquiries about account history.
              </p>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Legal Basis</h2>
            <div className="text-sm space-y-2">
              <p>
                Data retention is governed by applicable laws and our contractual obligations to 
                rights holders and licensees.
              </p>
              <p className="text-muted-foreground">
                For questions about data retention or to request information about your data, 
                please contact Tribes Rights Management LLC.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-3 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Tribes Rights Management LLC maintains data in accordance with industry standards 
              and applicable regulations. This policy may be updated periodically.
            </p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
