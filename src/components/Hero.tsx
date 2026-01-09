import { Link } from "react-router-dom";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { THEME_DARK_BG } from "@/lib/theme";

interface HeroProps {
  /** If provided, renders a button that scrolls to the anchor. Otherwise renders a Link to /our-approach */
  contactAnchor?: string;
}

export function Hero({ contactAnchor }: HeroProps) {
  const scrollToContact = () => {
    if (contactAnchor) {
      document.getElementById(contactAnchor)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section data-theme="dark" className="pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48" style={{ backgroundColor: THEME_DARK_BG }}>
      <div className={CONTENT_CONTAINER_CLASS}>
        <div className="max-w-[640px]">
          {/* Eyebrow */}
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
          <div className="w-16 h-px bg-white/10 mb-10" />

          {/* CTA Link */}
          {contactAnchor ? (
            <button
              onClick={scrollToContact}
              className="text-sm text-white/75 hover:text-white/85 transition-opacity duration-160 underline underline-offset-4 decoration-white/30"
            >
              Contact
            </button>
          ) : (
            <Link
              to="/our-approach"
              className="text-xs text-white/55 hover:text-white/85 transition-opacity duration-160 underline underline-offset-4 decoration-white/20"
            >
              Our approach
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
