import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";

export default function MarketingPage() {
  return (
    <PublicLayout>
      {/* Hero - Near-black (#111214) */}
      <section className="bg-[#111214] pt-36 pb-32 md:pt-44 md:pb-40 lg:pt-52 lg:pb-48">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="max-w-[640px]">
            {/* Logo */}
            <p className="text-sm font-medium tracking-[0.08em] text-[#C9C9CC] mb-14">
              TRIBES
            </p>
            
            {/* H1 - Institutional weight, refined letter-spacing */}
            <h1 className="text-[40px] md:text-[56px] lg:text-[72px] font-medium leading-[1.08] tracking-[-0.015em] text-white mb-8">
              Rights management, built to last.
            </h1>
            
            {/* Secondary supporting line - Quiet, subordinate */}
            <p className="text-base md:text-lg font-light text-white/45 leading-[1.5] tracking-[0.01em] mb-16">
              Publishing administration, built for precision.
            </p>
            
            {/* Divider */}
            <div className="w-16 h-px bg-white/10 mb-8" />
            
            {/* Micro-line removed - slogan is definitive, no secondary taglines */}
            
            {/* Understated link */}
            <Link 
              to="/our-approach" 
              className="text-xs text-white/55 hover:text-white/75 transition-colors underline underline-offset-4 decoration-white/20"
            >
              Our approach
            </Link>
          </div>
        </div>
      </section>

      {/* Built for Permanence — Structural Differentiation (Desktop: after hero, Mobile: after Who It's For) */}
      <section className="pt-12 pb-16 md:pt-14 md:pb-20 bg-background border-b border-border/30 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="max-w-[560px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80 mb-7">
              Built for permanence
            </p>
            <p className="text-[19px] text-foreground/80 leading-[1.65] mb-8">
              Most publishing problems don't come from bad intent—they come from records that weren't built to hold up over time.
            </p>
            <div className="space-y-2.5 pt-1 border-t border-border/20">
              <p className="text-[15px] font-medium text-foreground/70 leading-snug pt-4">
                Permanent ownership records
              </p>
              <p className="text-[15px] font-medium text-foreground/70 leading-snug">
                Deterministic splits and metadata
              </p>
              <p className="text-[15px] font-medium text-foreground/70 leading-snug">
                Documentation designed to withstand audits, disputes, and time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground mb-10">
            Who It's For
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Songwriters & Producers
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get your copyrights registered, royalties collected, and records organized—so ownership and income remain clear over time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Rights Holders
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clear ownership records, structured licensing, reliable income tracking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Commercial & Broadcast
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clear music rights for your projects with proper authorization, documentation, and records that hold up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Permanence — Mobile Only (appears after Who It's For) */}
      <section className="pt-8 pb-12 bg-background border-b border-border/30 md:hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-[320px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80 mb-5">
              Built for permanence
            </p>
            <p className="text-[17px] text-foreground/80 leading-[1.6] mb-6">
              Most publishing problems don't come from bad intent—they come from records that weren't built to hold up over time.
            </p>
            <div className="space-y-2 pt-1 border-t border-border/20">
              <p className="text-[14px] font-medium text-foreground/70 leading-snug pt-3">
                Permanent ownership records
              </p>
              <p className="text-[14px] font-medium text-foreground/70 leading-snug">
                Deterministic splits and metadata
              </p>
              <p className="text-[14px] font-medium text-foreground/70 leading-snug">
                Documentation designed to withstand audits, disputes, and time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Music as an Asset - Full-width dark section */}
      <section id="asset-management" className="py-24 md:py-32" style={{ backgroundColor: '#111214' }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column */}
            <div>
              <p 
                className="text-xs font-medium uppercase tracking-[0.12em] mb-8"
                style={{ color: 'rgba(255,255,255,0.60)' }}
              >
                Music as an Asset
              </p>
              <h2 
                className="text-[28px] md:text-[36px] font-medium leading-[1.2] tracking-[-0.01em] mb-8"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                Your catalog is a long-term asset. We treat it that way.
              </h2>
              <p 
                className="text-base leading-[1.8]"
                style={{ color: 'rgba(255,255,255,0.72)' }}
              >
                Publishing administration isn't paperwork—it's asset management. We handle rights, data, income, and documentation with the same rigor you'd expect from any serious financial steward. The goal is simple: protect what you've built, keep it organized, and make sure it holds up over time.
              </p>
            </div>
            
            {/* Right Column - Three stacked blocks */}
            <div className="space-y-12 lg:pt-12">
              <div>
                <h3 
                  className="text-lg font-medium mb-3"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  Clear Ownership
                </h3>
                <p 
                  className="text-sm leading-[1.7]"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  Structured records of who owns what—splits, metadata, and agreements maintained as permanent reference.
                </p>
              </div>
              <div>
                <h3 
                  className="text-lg font-medium mb-3"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  Reliable Financials
                </h3>
                <p 
                  className="text-sm leading-[1.7]"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  Accurate collections, clear reporting, and records that stay consistent over time.
                </p>
              </div>
              <div>
                <h3 
                  className="text-lg font-medium mb-3"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  Lasting Documentation
                </h3>
                <p 
                  className="text-sm leading-[1.7]"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  Agreements, licenses, and identifiers organized for audits, transactions, or whenever you need them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: Dark to Light */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Philosophical Anchor — Category Reframe */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="max-w-[580px]">
            <p className="text-[18px] md:text-[20px] text-foreground/80 leading-[1.7] tracking-[-0.005em]">
              Over time, the difference between administration and stewardship is whether records survive the people who made them.
            </p>
          </div>
        </div>
      </section>

      {/* How Licensing Works - Increased density for cognitive focus */}
      <section id="how-it-works" className="py-20 md:py-24 scroll-mt-24 bg-background border-t border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] mb-4 text-muted-foreground">
            How Licensing Works
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-12 max-w-[640px] text-foreground">
            Every request is reviewed before any agreement is issued.
          </p>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium mb-1.5 text-muted-foreground">
                  01
                </p>
                <h3 className="text-lg font-medium mb-2 text-foreground">
                  Submit
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tell us what you want to use and how. The details you provide become the foundation of the agreement.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1.5 text-muted-foreground">
                  02
                </p>
                <h3 className="text-lg font-medium mb-2 text-foreground">
                  Review
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We verify ownership, splits, and usage details—so the agreement reflects the correct terms from the start.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium mb-1.5 text-muted-foreground">
                  03
                </p>
                <h3 className="text-lg font-medium mb-2 text-foreground">
                  Execute
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sign and pay (if applicable) in one step. Once executed, the license becomes a binding reference.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1.5 text-muted-foreground">
                  04
                </p>
                <h3 className="text-lg font-medium mb-2 text-foreground">
                  Record
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your agreement is stored as a permanent record—retrievable whenever you need it, years from now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer transition — Clear visual separation */}
      <div className="h-px bg-border/60" />
    </PublicLayout>
  );
}
