import { PublicLayout } from "@/components/PublicLayout";
import { Hero } from "@/components/Hero";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";

export default function PreLaunchPage() {
  return (
    <PublicLayout logoOnly hideFooterLinks mobileContactAnchor="contact" darkBackground>
      {/* Shared Hero Component */}
      <Hero contactAnchor="contact" />

      {/* Contact Section */}
      <section data-theme="light" id="contact" className="py-24 md:py-32 scroll-mt-24 bg-background">
        <div className={CONTENT_CONTAINER_CLASS}>
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
                  className="text-foreground hover:opacity-85 transition-opacity duration-160 underline underline-offset-4 decoration-foreground/30"
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
                  className="text-foreground hover:opacity-85 transition-opacity duration-160 underline underline-offset-4 decoration-foreground/30"
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
