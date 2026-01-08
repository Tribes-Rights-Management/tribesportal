import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";

export default function PreLaunchPage() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout logoOnly hideFooterLinks mobileContactAnchor="contact">
      {/* Hero */}
      <section data-theme="dark" className="bg-[#111214] pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48">
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
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section data-theme="light" id="contact" className="py-24 md:py-32 scroll-mt-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="max-w-[560px]">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-6">
              Contact
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  For inquiries regarding publishing administration and rights management, please reach out at:
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
    </PublicLayout>
  );
}
