import { ContentPageLayout } from "@/components/ContentPageLayout";

export default function TermsPage() {
  return (
    <ContentPageLayout>
      {/* Page Title */}
      <h1 className="text-foreground mb-3">
        Terms of Use
      </h1>
      
      {/* Meta Line */}
      <p className="text-[13px] text-muted-foreground/60 mb-10">
        Last Updated: January 6, 2026
      </p>

      {/* Intro */}
      <p className="text-base leading-[1.65] text-muted-foreground mb-16">
        These Terms govern your access to and use of the websites, portals, and services provided by Tribes Rights Management LLC.
      </p>

      {/* Content Sections */}
      <div className="space-y-10">

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">1. Definitions</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground leading-relaxed">
            <li>"Company" means Tribes Rights Management LLC.</li>
            <li>"User" or "you" means anyone accessing or using the Services.</li>
            <li>"General User" means someone accessing only the public portions.</li>
            <li>"Registered User" means someone approved to access the portal.</li>
            <li>"Materials" means all content made available through the Services.</li>
            <li>"Records" means executed agreements and related documentation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">2. Eligibility</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>The Services are intended for business and professional use. You represent that:</p>
            <ul className="space-y-1 ml-4">
              <li>— You are at least 18 years old.</li>
              <li>— If acting for an entity, you have authority to bind it.</li>
              <li>— The information you provide is accurate.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">3. License to Use</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              We grant you a limited, non-exclusive, revocable license to use the Services for their intended purposes.
            </p>
            <p>You don't acquire any ownership rights in the Services or Materials.</p>
            <p>We may suspend or terminate access at any time.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">4. Portal Access</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The portal is only for approved users. Unauthorized access is a violation of these Terms and may result in termination.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">5. Account Security</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>You agree to:</p>
            <ul className="space-y-1 ml-4">
              <li>— Use your access credentials only for authorized purposes</li>
              <li>— Not share or transfer access</li>
              <li>— Notify us of any unauthorized access</li>
              <li>— Log out at the end of each session</li>
            </ul>
            <p>
              We're not responsible for losses from unauthorized access caused by your failure to secure your account.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">6. Licensing</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>License requests are submitted through the portal and reviewed before approval. You acknowledge that:</p>
            <ul className="space-y-1 ml-4">
              <li>— Requests are not automatically approved</li>
              <li>— No rights are granted until a license is fully executed</li>
              <li>— Electronic signatures are legally binding</li>
              <li>— Executed agreements are permanent records</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">7. Electronic Communications</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By using the Services, you consent to receive communications electronically. Electronic records and signatures have the same legal effect as physical ones.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">8. Your Submissions</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>You're responsible for information you submit. You represent that your submissions:</p>
            <ul className="space-y-1 ml-4">
              <li>— Are accurate and lawful</li>
              <li>— Don't infringe third-party rights</li>
              <li>— Don't contain harmful content</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">9. Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your use of the Services is subject to our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">10. Intellectual Property</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              The Services and Materials are owned by us or our licensors and protected by intellectual property laws.
            </p>
            <p>
              You may not copy, reverse engineer, or distribute the Services or Materials without written permission.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">11. Disclaimers</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="uppercase text-xs">
              The Services are provided "as is" without warranties of any kind.
            </p>
            <p>We don't guarantee uninterrupted or error-free operation.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">12. Limitation of Liability</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="uppercase text-xs">
              To the maximum extent permitted by law, we're not liable for indirect, incidental, or consequential damages.
            </p>
            <p className="uppercase text-xs">
              Our total liability won't exceed ten U.S. dollars ($10.00).
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">13. Indemnification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You agree to indemnify us from claims arising from your breach of these Terms or misuse of the Services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">14. Termination</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>We may suspend or terminate access at any time. Termination doesn't affect:</p>
            <ul className="space-y-1 ml-4">
              <li>— Executed agreements</li>
              <li>— Payment obligations</li>
              <li>— Record retention requirements</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">15. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms are governed by the laws of Texas. Disputes will be resolved in courts located in Dallas County, Texas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">16. Miscellaneous</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>These Terms are the entire agreement regarding use of the Services.</p>
            <p>If any provision is unenforceable, the rest remains in effect.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">17. Contact</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-0.5">
            <p>Tribes Rights Management LLC</p>
            <p>3839 McKinney Ave, Suite 155 #2374</p>
            <p>Dallas, TX 75204</p>
            <p>
              Email:{" "}
              <a 
                href="mailto:admin@tribesassets.com" 
                className="text-foreground underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                admin@tribesassets.com
              </a>
            </p>
          </div>
        </section>

      </div>
    </ContentPageLayout>
  );
}
