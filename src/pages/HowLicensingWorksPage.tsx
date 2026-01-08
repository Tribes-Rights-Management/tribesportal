import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";

export default function HowLicensingWorksPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h1 className="mb-4">
              How Licensing Works
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A step-by-step look at how we handle license requests—from intake to permanent record.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Overview */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              Overview
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                Licensing is documentation, not just permission.
              </p>
              <p className="leading-relaxed">
                Every request is reviewed. Every agreement is issued with clarity. Every executed license is stored permanently. This page explains how the process works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* What We Ask For */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              What We Ask For
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Every license request starts with a short form. We ask about the song, how you plan to use it, for how long, and where.
              </p>
              <p className="leading-relaxed">
                This isn't red tape—it's how we make sure the right rights get licensed and your agreement reflects actual usage.
              </p>
              <p className="leading-relaxed">
                You don't need to be a legal expert. Just be clear about how the music will be used.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* One Song per Request */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              One Song per Request
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Each request covers one song. This keeps things precise and avoids confusion about ownership or scope.
              </p>
              <p className="leading-relaxed">
                If you need multiple license types for the same song (say, sync and mechanical), you can request them together. Each approved use gets its own license.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Review and Clarification */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              Review
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Every request is reviewed by our team before anything moves forward.
              </p>
              <p className="leading-relaxed">
                If we need more information, we'll reach out. No license is approved until the terms are clear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* License Structure */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              License Structure
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                When a request is approved, we issue a license package that includes:
              </p>
              <ul className="space-y-2 pl-6 list-disc">
                <li className="leading-relaxed">A cover page with your details, the song, and what's approved</li>
                <li className="leading-relaxed">A standalone license document for each approved use</li>
              </ul>
              <p className="leading-relaxed">
                Each license gets a unique ID so it can be tracked, referenced, and audited on its own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Execution */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              Execution
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Approved licenses are signed electronically. Signature and payment (when applicable) happen together.
              </p>
              <p className="leading-relaxed">
                A license becomes legally binding only after execution is complete. Your account shows the current status at all times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Records and Access */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              Records
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Executed licenses are stored permanently. They're never deleted or overwritten.
              </p>
              <p className="leading-relaxed">
                You can download your agreements anytime—months or years later—with the full execution history intact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Access and Oversight */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-8">
              Account Approval
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Licensing requests require an approved account. This keeps requests accurate and on record.
              </p>
              <p className="leading-relaxed">
                This isn't a public marketplace—it's a reviewed process designed for accuracy and long-term integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Closing + Disclaimer */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-[640px]">
            <p className="text-lg font-medium text-foreground leading-relaxed mb-4">
              Every license is reviewed, executed, and recorded.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Your agreements are preserved with full execution history.
            </p>
            <div className="pt-6 border-t border-border">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mb-3">
                Legal Notice
              </p>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                This page is for informational purposes only and doesn't constitute legal advice or a binding offer. All license requests are subject to review and execution of a formal agreement. No rights are granted until a license is fully executed. If there's any conflict between this description and an executed agreement, the executed agreement governs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
