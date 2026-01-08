import { ContentPageLayout } from "@/components/ContentPageLayout";

export default function HowPublishingAdminWorksPage() {
  return (
    <ContentPageLayout>
      {/* Page Title */}
      <h1 className="text-foreground mb-10">
        How Administration Works
      </h1>

      {/* Intro */}
      <p className="text-base leading-[1.65] text-muted-foreground mb-16">
        This page outlines how Tribes administers rights, licenses, and records—from initial intake through permanent documentation.
      </p>

      {/* Content Sections */}
      <div className="space-y-10">

        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Before Engagement</h2>
          <ul className="space-y-2">
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Initial inquiry and review</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Rights ownership verification</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Required documentation</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Evaluation of catalog scope and suitability</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Onboarding</h2>
          <ul className="space-y-2">
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Execution of administration agreements</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Collection of metadata, splits, and identifiers</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Registration with relevant societies and platforms</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Establishment of reporting and record systems</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Ongoing Administration</h2>
          <ul className="space-y-2">
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Maintenance of ownership records</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Income tracking and reconciliation</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Ongoing updates to metadata and agreements</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Periodic reporting</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Licensing Process</h2>
          <ul className="space-y-2">
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Request submission</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Review and authorization</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Documentation and execution</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Permanent record retention</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Recordkeeping & Continuity</h2>
          <ul className="space-y-2">
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Long-term storage of agreements and identifiers</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Audit readiness</span>
            </li>
            <li className="text-sm leading-[1.65] text-muted-foreground flex items-start gap-3">
              <span className="text-muted-foreground/40 select-none">•</span>
              <span>Support for transactions, transfers, or future valuation</span>
            </li>
          </ul>
        </section>

      </div>
    </ContentPageLayout>
  );
}
