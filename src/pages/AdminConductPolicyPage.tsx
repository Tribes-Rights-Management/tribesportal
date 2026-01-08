import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminConductPolicyPage() {
  // Prevent indexing of internal policy page
  useEffect(() => {
    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow";
    document.head.appendChild(metaRobots);
    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-[720px]">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Admin Conduct Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Internal policy governing administrative access and use.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Effective Date: January 6, 2026
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            This Portal Conduct Policy governs internal access to and use of the Tribes 
            Rights Licensing platform by authorized personnel ("Administrators").
          </p>

          {/* 1. Authorized Use Only */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">1. Authorized Use Only</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Administrative access is granted solely for legitimate business purposes related 
              to licensing review, approval, execution, recordkeeping, and support. Any use 
              outside these purposes is prohibited.
            </p>
          </div>

          {/* 2. No Alteration of Executed Records */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">2. No Alteration of Executed Records</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Executed licenses and finalized records may not be modified, deleted, obscured, 
              or replaced. Corrections or changes must be handled through superseding agreements 
              or documented amendments.
            </p>
          </div>

          {/* 3. Role-Based Access */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">3. Role-Based Access</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Administrators must act within the scope of their assigned role. Viewing, approving, 
              exporting, or communicating license materials outside assigned permissions is not permitted.
            </p>
          </div>

          {/* 4. No Informal Commitments */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">4. No Informal Commitments</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Administrators may not make verbal or written assurances regarding approval, pricing, 
              rights granted, or timelines outside the Platform's formal workflow.
            </p>
          </div>

          {/* 5. Communications Integrity */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">5. Communications Integrity</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All material licensing communications must occur through approved channels. 
              Off-platform commitments or "side agreements" are prohibited.
            </p>
          </div>

          {/* 6. Impersonation and Access Monitoring */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">6. Impersonation and Access Monitoring</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If user impersonation features are enabled, all actions taken while impersonating 
              a user are logged and attributed accordingly. Impersonation must be used only for 
              support and troubleshooting purposes.
            </p>
          </div>

          {/* 7. Audit and Enforcement */}
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">7. Audit and Enforcement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All administrative actions are subject to logging, review, and audit. Violations 
              of this policy may result in suspension or termination of access and, where 
              applicable, further disciplinary or legal action.
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
