import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminGuidelinesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-content-fade">
        {/* Back */}
        <Link
          to="/admin/settings"
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Settings
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[24px] font-medium mb-3">
            Operating Inside Tribes Responsibly
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Administrative guidelines and incident response protocol.
          </p>
        </div>

        <div className="space-y-16">
          {/* Section 1: Welcome */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Welcome to the Tribes Administrative Environment
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>
                Administrative access in Tribes carries responsibility.
              </p>
              <p>
                Actions taken here affect legally binding records, long-term rights management, 
                and permanent documentation relied upon by creators, organizations, and institutions. 
                This system is designed to favor clarity, traceability, and durability over speed.
              </p>
              <p className="text-foreground font-medium">
                Every action is logged. Nothing is casual.
              </p>
            </div>
          </section>

          {/* Section 2: Your Role */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Your Role as an Administrator
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>
                As an administrator, you are not simply managing data—you are stewarding records.
              </p>
              <p>Your responsibilities include:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Reviewing license requests for accuracy and scope</li>
                <li>Confirming that requested usage aligns with the information provided</li>
                <li>Ensuring that approvals reflect correct terms before execution</li>
                <li>Preserving the integrity of the permanent record</li>
              </ul>
              <p className="text-foreground">
                Automation supports this system. Judgment governs it.
              </p>
            </div>
          </section>

          {/* Section 3: Approval Finality */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Approval is a Point of Finality
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>Once a license is approved:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Core terms cannot be edited</li>
                <li>Execution may proceed</li>
                <li>The agreement becomes enforceable upon completion</li>
              </ul>
              <p>
                If a mistake is discovered after approval, the correct response is not to modify 
                the original license, but to issue a superseding license with proper documentation.
              </p>
              <p className="text-foreground font-medium">
                This distinction matters.
              </p>
            </div>
          </section>

          {/* Section 4: Permanence */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Permanence is Intentional
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>
                Licenses, license packages, and audit events are never deleted.
              </p>
              <p>
                This is not a limitation—it is a safeguard. Permanent records protect all parties 
                when questions arise months or years later. Treat every action as something that 
                may be reviewed long after it occurs.
              </p>
            </div>
          </section>

          {/* Section 5: When in Doubt */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              When in Doubt
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>If any aspect of a request is unclear:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Pause</li>
                <li>Request clarification</li>
                <li>Do not approve prematurely</li>
              </ul>
              <p className="text-foreground font-medium">
                Speed is never more important than accuracy.
              </p>
            </div>
          </section>

          {/* Section 6: Operating Principle */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Operating Principle
            </h2>
            <div className="py-6 px-6 bg-muted/30 rounded">
              <p className="text-[15px] text-foreground font-medium leading-relaxed">
                If an action cannot be defended later, it should not be taken now.
              </p>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Incident Response Section */}
          <section className="space-y-6">
            <h2 className="text-[18px] font-medium text-foreground">
              When Something Goes Wrong
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Incident response protocol for administrators.
            </p>
          </section>

          {/* Guiding Principle */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Guiding Principle
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p className="text-foreground font-medium">
                Mistakes are addressed through documentation—not concealment.
              </p>
              <p>
                Tribes is designed to handle errors transparently, without compromising 
                the integrity of the record.
              </p>
            </div>
          </section>

          {/* Scenario 1 */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-medium text-foreground">
              Scenario 1: Incorrect information discovered before approval
            </h3>
            <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
              <p className="text-[12px] uppercase tracking-wide">Response:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Do not approve the license</li>
                <li>Change status to Needs Info</li>
                <li>Request clarification from the user</li>
                <li>Document the reason in internal notes if applicable</li>
              </ul>
              <p className="text-[13px]">No further action is required.</p>
            </div>
          </section>

          {/* Scenario 2 */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-medium text-foreground">
              Scenario 2: Incorrect information discovered after approval but before execution
            </h3>
            <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
              <p className="text-[12px] uppercase tracking-wide">Response:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Do not attempt to edit approved terms</li>
                <li>Halt execution</li>
                <li>Issue a superseding license if changes are required</li>
                <li>Record the reason for supersession clearly</li>
              </ul>
              <p className="text-[13px]">The original license must remain intact.</p>
            </div>
          </section>

          {/* Scenario 3 */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-medium text-foreground">
              Scenario 3: Incorrect information discovered after execution
            </h3>
            <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
              <p className="text-[12px] uppercase tracking-wide">Response:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Do not modify or remove the executed license</li>
                <li>Issue a superseding license reflecting corrected terms</li>
                <li>Ensure the supersession reason is recorded</li>
                <li>Notify relevant parties as appropriate</li>
              </ul>
              <p className="text-[13px]">
                Executed licenses remain legally valid records, even when superseded.
              </p>
            </div>
          </section>

          {/* Scenario 4 */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-medium text-foreground">
              Scenario 4: User disputes scope or interpretation
            </h3>
            <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
              <p className="text-[12px] uppercase tracking-wide">Response:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Refer to the executed license language</li>
                <li>Confirm scope using the permanent record</li>
                <li>Escalate internally if interpretation is unclear</li>
                <li>Do not revise historical records to resolve disputes</li>
              </ul>
              <p className="text-[13px]">
                Resolution occurs through clarification or new documentation—not alteration.
              </p>
            </div>
          </section>

          {/* Scenario 5 */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-medium text-foreground">
              Scenario 5: Internal administrative error
            </h3>
            <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
              <p className="text-[12px] uppercase tracking-wide">Response:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Acknowledge the error internally</li>
                <li>Preserve all existing records</li>
                <li>Correct through documented supersession or addendum</li>
                <li>Avoid informal fixes or undocumented workarounds</li>
              </ul>
              <p className="text-[13px]">
                Internal integrity matters as much as external trust.
              </p>
            </div>
          </section>

          {/* Escalation */}
          <section className="space-y-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Escalation Guidance
            </h2>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>Escalate to a Super Admin when:</p>
              <ul className="space-y-2 pl-6 list-disc">
                <li>A change affects executed licenses</li>
                <li>A dispute involves legal interpretation</li>
                <li>A systemic issue is identified</li>
                <li>A deviation from standard process is being considered</li>
              </ul>
            </div>
          </section>

          {/* Final Reminder */}
          <section className="space-y-6 pb-8">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Final Reminder
            </h2>
            <div className="py-6 px-6 bg-muted/30 rounded space-y-3">
              <p className="text-[15px] text-foreground font-medium leading-relaxed">
                The system protects you when you follow it.
              </p>
              <p className="text-[15px] text-foreground font-medium leading-relaxed">
                It exposes you when you bypass it.
              </p>
              <p className="text-[14px] text-muted-foreground mt-4">
                Operate accordingly.
              </p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
