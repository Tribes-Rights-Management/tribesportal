import { Link } from "react-router-dom";
import { ContentPageLayout } from "@/components/ContentPageLayout";

export default function ServicesPage() {
  return (
    <ContentPageLayout>
      {/* Page Title */}
      <h1 className="text-foreground mb-3">
        Services
      </h1>
      <p className="text-muted-foreground leading-relaxed mb-12">
        Publishing administration built for accuracy, continuity, and long-term clarity.
      </p>

      {/* Content Sections */}
      <div className="space-y-10">

        {/* Music as an Asset Class */}
        <section className="pb-10 border-b border-border">
          <h2 className="text-foreground mb-4">
            Music as an Asset
          </h2>
          <div className="text-muted-foreground leading-relaxed space-y-4 text-[15px]">
            <p>
              Publishing administration isn't clerical work. It's long-term asset management.
            </p>
            <p>
              At Tribes, we treat music as a durable financial asset—one that requires clear ownership, 
              structured rights administration, and continuity over time.
            </p>
            <div>
              <p className="text-foreground font-medium mb-3">That means:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 select-none">•</span>
                  <span>Clear ownership records that hold up over time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 select-none">•</span>
                  <span>Permanent agreements and splits you can always reference</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 select-none">•</span>
                  <span>Consistent income tracking and reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 select-none">•</span>
                  <span>Documentation preserved for audits, transactions, or valuation</span>
                </li>
              </ul>
            </div>
            <p>
              Your records stay accessible. Your ownership stays documented. Your agreements stay enforceable.
            </p>
          </div>
        </section>

        {/* Publishing Administration */}
        <section className="pb-10 border-b border-border">
          <h2 className="text-foreground mb-2">
            Publishing Administration
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            We register your works, track ownership, collect royalties, and report earnings—so you know where your money comes from.
          </p>
        </section>

        {/* Rights Management */}
        <section className="pb-10 border-b border-border">
          <h2 className="text-foreground mb-2">
            Rights Management
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            We maintain structured ownership records and metadata so your rights are always documented and defensible.
          </p>
        </section>

        {/* Licensing */}
        <section className="pb-10 border-b border-border">
          <h2 className="text-foreground mb-2">
            Licensing
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3 text-[15px]">
            We review, authorize, and issue licenses—with every agreement recorded for long-term reference.
          </p>
          <Link 
            to="/how-licensing-works" 
            className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
          >
            Learn how licensing works
          </Link>
        </section>

        {/* Financial Oversight */}
        <section className="pb-10 border-b border-border">
          <h2 className="text-foreground mb-2">
            Financial Oversight
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            We reconcile income, produce clear reports, and keep records you can rely on.
          </p>
        </section>

        {/* Documentation & Records */}
        <section className="pb-10 border-b border-border">
          <h2 className="text-foreground mb-2">
            Documentation & Records
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            Executed agreements, identifiers, and audit trails—accessible when you need them.
          </p>
        </section>

        {/* Access Pathways */}
        <section className="pt-6">
          {/* Licensing Access */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-foreground mb-2">
              Request Licensing Access
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              For licensing music we administer. Requires account approval.
            </p>
            <Link 
              to="/licensing" 
              className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
            >
              Request access
            </Link>
          </div>
          
          {/* Service Inquiry */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-xl font-medium text-foreground mb-2">
              Inquire About Services
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              For publishing administration, rights management, or catalog support.
            </p>
            <Link 
              to="/inquire" 
              className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
            >
              Inquire
            </Link>
          </div>
        </section>

      </div>
    </ContentPageLayout>
  );
}
