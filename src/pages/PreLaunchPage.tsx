import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { getCopyrightLine } from "@/lib/copyright";

export default function PreLaunchPage() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header — Minimal */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#111214] border-b border-white/[0.08]"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          height: 64,
        }}
      >
        <nav className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6 md:px-10 lg:px-20">
          <Link
            to="/"
            className="text-white hover:text-white/80 font-medium tracking-tight transition-colors duration-150"
            style={{
              fontSize: 15,
              letterSpacing: "-0.005em",
              lineHeight: 1.4,
            }}
          >
            {BRAND.legalName}
          </Link>

          <button
            onClick={scrollToContact}
            className="text-white/65 hover:text-white/85 transition-colors duration-150"
            style={{
              fontSize: 14,
              fontWeight: 450,
              letterSpacing: "0.005em",
              lineHeight: 1.5,
            }}
          >
            Contact
          </button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#111214] pt-36 pb-32 md:pt-44 md:pb-40 lg:pt-52 lg:pb-48">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
            <div className="max-w-[640px]">
              <p className="text-sm font-medium tracking-[0.08em] text-[#C9C9CC] mb-14">
                TRIBES
              </p>

              <h1 className="text-[40px] md:text-[56px] lg:text-[72px] font-medium leading-[1.08] tracking-[-0.015em] text-white mb-8">
                Rights management, built to last.
              </h1>

              <p className="text-base md:text-lg font-light text-white/45 leading-[1.5] tracking-[0.01em] mb-16">
                Publishing administration, built for precision.
              </p>

              <div className="w-16 h-px bg-white/10 mb-10" />

              <button
                onClick={scrollToContact}
                className="text-sm text-white/75 hover:text-white transition-colors duration-150 underline underline-offset-4 decoration-white/30"
              >
                Contact us
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section — Email only */}
        <section id="contact" className="py-24 md:py-32 scroll-mt-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
            <div className="max-w-[560px]">
              <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-6">
                Contact
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    For inquiries regarding publishing administration and rights management, please contact us at:
                  </p>
                  <a
                    href="mailto:admin@tribesassets.com"
                    className="text-foreground hover:text-foreground/80 transition-colors duration-150 underline underline-offset-4 decoration-foreground/30"
                    style={{ fontSize: 15 }}
                  >
                    admin@tribesassets.com
                  </a>
                </div>

                <div>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    For inquiries related to licensing, translations, or other copyright permissions, please contact:
                  </p>
                  <a
                    href="mailto:licensing@tribesassets.com"
                    className="text-foreground hover:text-foreground/80 transition-colors duration-150 underline underline-offset-4 decoration-foreground/30"
                    style={{ fontSize: 15 }}
                  >
                    licensing@tribesassets.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — Minimal */}
      <footer className="bg-[#111214] py-10 md:py-12 border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p
              className="text-[#8C8C8C] leading-relaxed"
              style={{ fontSize: 11 }}
            >
              {getCopyrightLine()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
