import { ContentPageLayout } from "@/components/ContentPageLayout";

/**
 * OUR APPROACH PAGE — Uses global ContentPageLayout standard
 * NO page-specific typography or spacing overrides.
 */
export default function OurApproachPage() {
  return (
    <ContentPageLayout
      title="Our Approach"
      lede="At Tribes, publishing administration is long-term rights stewardship—treating music as a durable asset that requires precision, continuity, and disciplined recordkeeping over time."
    >
      <section>
        <h2 className="text-foreground mb-6">Principles</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Precision Over Volume</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              We prioritize accuracy, clean ownership records, and defensible documentation over scale.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Continuity Over Convenience</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Rights administration is long-term work. Our systems and processes are designed to hold up over years, not reporting cycles.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Clarity for Creators and Rights Holders</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Clients should always understand what they own, how it is administered, and how income flows.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Records That Endure</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Agreements, splits, identifiers, and financial data are maintained as permanent records, not disposable files.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-4">What Clients Can Expect</h2>
        
        <ul className="space-y-2">
          <li className="text-[15px] leading-relaxed text-muted-foreground flex items-start gap-3">
            <span className="text-muted-foreground/40 select-none">•</span>
            <span>Structured onboarding and clear requirements</span>
          </li>
          <li className="text-[15px] leading-relaxed text-muted-foreground flex items-start gap-3">
            <span className="text-muted-foreground/40 select-none">•</span>
            <span>Ongoing rights maintenance and reporting</span>
          </li>
          <li className="text-[15px] leading-relaxed text-muted-foreground flex items-start gap-3">
            <span className="text-muted-foreground/40 select-none">•</span>
            <span>Disciplined licensing review and authorization</span>
          </li>
          <li className="text-[15px] leading-relaxed text-muted-foreground flex items-start gap-3">
            <span className="text-muted-foreground/40 select-none">•</span>
            <span>Long-term record integrity for audits, transactions, and valuation</span>
          </li>
        </ul>
      </section>

      {/* Closing Statement */}
      <p className="text-base leading-relaxed text-foreground pt-6">
        Tribes exists to manage rights properly—so creators and rights holders can build with confidence.
      </p>
    </ContentPageLayout>
  );
}
