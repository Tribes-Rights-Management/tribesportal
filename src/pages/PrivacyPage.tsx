import { ContentPageLayout } from "@/components/ContentPageLayout";

/**
 * PRIVACY POLICY PAGE — Uses global ContentPageLayout standard
 * NO page-specific typography or spacing overrides.
 */
export default function PrivacyPage() {
  return (
    <ContentPageLayout title="Privacy Policy">
      {/* Meta Line */}
      <p className="text-[13px] text-muted-foreground/60 -mt-7 mb-10">
        Last Updated: January 6, 2026
      </p>

      {/* Intro */}
      <p className="text-base leading-relaxed text-muted-foreground mb-10">
        This Privacy Policy explains how Tribes Rights Management LLC collects, uses, and shares information when you use our websites, portals, and services.
      </p>

      <section>
        <h2 className="text-foreground mb-3">Information We Collect</h2>
        <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
          <p>
            What we collect depends on how you use our Services—whether you're browsing the public site or using the portal as an approved user.
          </p>
          
          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Website Visitors</h3>
            <p>
              When you fill out a form, sign up for updates, or reach out, we may collect your name, email address, phone number, and any other information you choose to share.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Portal Users</h3>
            <p className="mb-2">If you're an approved portal user, we may also collect:</p>
            <ul className="space-y-1 ml-4">
              <li>— Business name and contact details</li>
              <li>— License application information</li>
              <li>— Login activity and session data</li>
              <li>— Payment information (processed by third parties)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[15px] font-medium text-foreground mb-2">Automatic Collection</h3>
            <p>
              When you use our Services, we automatically collect device and usage information including browser type, operating system, IP address, pages viewed, and referring URLs. We also use cookies to improve functionality and analytics.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-3">How We Use Information</h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed">
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="space-y-1 ml-4">
            <li>— Operate and improve our Services</li>
            <li>— Process license requests and transactions</li>
            <li>— Create and store executed agreements</li>
            <li>— Send confirmations and administrative messages</li>
            <li>— Respond to inquiries</li>
            <li>— Detect and prevent fraud</li>
            <li>— Comply with legal obligations</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-3">When We Share Information</h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed">
          <p className="mb-2">We may share your information:</p>
          <ul className="space-y-1 ml-4">
            <li>— With service providers who help us operate</li>
            <li>— To facilitate licensing and royalty administration</li>
            <li>— With professional advisors</li>
            <li>— To comply with legal requirements</li>
            <li>— In connection with a business transfer</li>
            <li>— With your consent</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-3">Analytics</h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed space-y-2">
          <p>
            We use analytics services, including Google Analytics, to understand how people use our Services. This helps us improve performance and usability.
          </p>
          <p>
            Learn more about Google's data practices:{" "}
            <a 
              href="https://policies.google.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              policies.google.com/privacy
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-3">Data Retention</h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed space-y-2">
          <p>
            We keep personal information as long as needed to provide our Services and comply with legal obligations.
          </p>
          <p>
            Executed license agreements and related records are kept permanently as legal documentation.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-3">Your Rights</h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed space-y-2">
          <p>
            Depending on where you live, you may have rights to access, correct, or delete your personal information.
          </p>
          <p>
            Executed agreements and related records may not be eligible for deletion where retention is legally required.
          </p>
          <p>
            To make a request, email admin@tribesassets.com.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-3">California Privacy Rights</h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          California residents have additional rights under the CCPA/CPRA. We do not sell personal information.
        </p>
      </section>

      <section>
        <h2 className="text-foreground mb-3">Do Not Track</h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          Our Services do not respond to Do Not Track signals.
        </p>
      </section>

      <section>
        <h2 className="text-foreground mb-3">Contact</h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed space-y-0.5">
          <p>Tribes Rights Management LLC</p>
          <p>3839 McKinney Ave, Suite 155 #2374</p>
          <p>Dallas, TX 75204</p>
          <p>Email: admin@tribesassets.com</p>
        </div>
      </section>
    </ContentPageLayout>
  );
}
