import { PublicLayout } from "@/components/PublicLayout";
import { Hero } from "@/components/Hero";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { THEME_DARK_BG, THEME_LIGHT_BG } from "@/lib/theme";

export default function MarketingPage() {
  return (
    <PublicLayout darkBackground>
      {/* 1) HERO = BLACK */}
      <Hero />

      {/* 2) WHO IT'S FOR = WHITE */}
      <section 
        data-theme="light" 
        className="py-16 md:py-24"
        style={{ backgroundColor: THEME_LIGHT_BG }}
      >
        <div className={CONTENT_CONTAINER_CLASS}>
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/60 mb-10">
            Who It's For
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Songwriters & Producers
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Get your copyrights registered, royalties collected, and records organized—so ownership and income remain clear over time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Rights Holders
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Clear ownership records, structured licensing, reliable income tracking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Commercial & Broadcast
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Clear music rights for your projects with proper authorization, documentation, and records that hold up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle separator */}
      <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* 3) MUSIC AS AN ASSET = BLACK */}
      <section 
        data-theme="dark" 
        id="asset-management" 
        className="py-16 md:py-24"
        style={{ backgroundColor: THEME_DARK_BG }}
      >
        <div className={CONTENT_CONTAINER_CLASS}>
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
                Publishing administration isn't paperwork—it's asset management. We handle rights, data, income, and documentation with the same rigor you'd expect from any serious financial steward.
              </p>
            </div>
            
            {/* Right Column */}
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

      {/* Subtle separator */}
      <div className="h-px w-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />

      {/* 4) HOW COPYRIGHT CLEARANCE WORKS = WHITE */}
      <section 
        data-theme="light" 
        id="how-it-works" 
        className="py-16 md:py-24 scroll-mt-24"
        style={{ backgroundColor: THEME_LIGHT_BG }}
      >
        <div className={CONTENT_CONTAINER_CLASS}>
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] mb-4 text-foreground/60">
            How Copyright Clearance Works
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-12 max-w-[640px] text-foreground">
            Every request is reviewed before any agreement is issued.
          </p>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium mb-1.5 text-foreground/50">01</p>
                <h3 className="text-lg font-medium mb-2 text-foreground">Submit</h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  Tell us what you want to use and how. The details you provide become the foundation of the agreement.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1.5 text-foreground/50">02</p>
                <h3 className="text-lg font-medium mb-2 text-foreground">Review</h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  We verify ownership, splits, and usage details—so the agreement reflects the correct terms from the start.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium mb-1.5 text-foreground/50">03</p>
                <h3 className="text-lg font-medium mb-2 text-foreground">Execute</h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  Sign and pay (if applicable) in one step. Once executed, the license becomes a binding reference.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1.5 text-foreground/50">04</p>
                <h3 className="text-lg font-medium mb-2 text-foreground">Record</h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  Your agreement is stored as a permanent record—retrievable whenever you need it, years from now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5) FOOTER = BLACK (handled by PublicLayout) */}
    </PublicLayout>
  );
}